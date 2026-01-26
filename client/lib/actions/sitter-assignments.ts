'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function inviteSitter(petId: string, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Verify user owns this pet
  const { data: pet, error: petError } = await supabase
    .from('pets')
    .select('id, name, owner_id')
    .eq('id', petId)
    .eq('owner_id', user.id)
    .single();

  if (petError || !pet) {
    return { error: 'Pet not found or access denied' };
  }

  const sitter_email = (formData.get('sitter_email') as string).toLowerCase().trim();
  const start_date = formData.get('start_date') as string;
  const end_date = formData.get('end_date') as string;

  if (!sitter_email || !start_date || !end_date) {
    return { error: 'Email, start date, and end date are required' };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sitter_email)) {
    return { error: 'Invalid email format' };
  }

  // Check if dates are valid
  if (new Date(start_date) > new Date(end_date)) {
    return { error: 'End date must be after start date' };
  }

  // Check if there's already an active assignment for this pet and sitter
  const { data: existingAssignment } = await supabase
    .from('sitter_assignments')
    .select('id')
    .eq('pet_id', petId)
    .eq('sitter_email', sitter_email)
    .in('status', ['pending', 'accepted'])
    .single();

  if (existingAssignment) {
    return { error: 'This sitter already has an active or pending assignment for this pet' };
  }

  // Check if sitter already has an account
  const { data: sitterProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', sitter_email)
    .single();

  // Create assignment
  const { error } = await supabase
    .from('sitter_assignments')
    .insert({
      pet_id: petId,
      owner_id: user.id,
      sitter_id: sitterProfile?.id || null,
      sitter_email,
      start_date,
      end_date,
      status: 'pending',
    });

  if (error) {
    return { error: error.message };
  }

  // TODO: Send email invitation to sitter

  revalidatePath('/sitters');
  revalidatePath(`/pets/${petId}`);
  redirect('/sitters');
}

export async function acceptAssignment(assignmentId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Get user's profile to check email
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return { error: 'Profile not found' };
  }

  // Find and update the assignment (case-insensitive email match)
  const { data: assignment, error: fetchError } = await supabase
    .from('sitter_assignments')
    .select('*')
    .eq('id', assignmentId)
    .ilike('sitter_email', profile.email?.toLowerCase() || '')
    .eq('status', 'pending')
    .single();

  if (fetchError || !assignment) {
    return { error: 'Assignment not found or already processed' };
  }

  const { error } = await supabase
    .from('sitter_assignments')
    .update({
      status: 'accepted',
      sitter_id: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', assignmentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/sitters');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function declineAssignment(assignmentId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return { error: 'Profile not found' };
  }

  const { error } = await supabase
    .from('sitter_assignments')
    .update({
      status: 'declined',
      updated_at: new Date().toISOString(),
    })
    .eq('id', assignmentId)
    .ilike('sitter_email', profile.email?.toLowerCase() || '')
    .eq('status', 'pending');

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/sitters');
  return { success: true };
}

export async function revokeAssignment(assignmentId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Verify the user is the owner of this assignment
  const { data: assignment, error: fetchError } = await supabase
    .from('sitter_assignments')
    .select('*')
    .eq('id', assignmentId)
    .eq('owner_id', user.id)
    .single();

  if (fetchError || !assignment) {
    return { error: 'Assignment not found or access denied' };
  }

  const { error } = await supabase
    .from('sitter_assignments')
    .delete()
    .eq('id', assignmentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/sitters');
  return { success: true };
}

export async function getMyAssignments() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { assignments: [], error: 'Not authenticated' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return { assignments: [], error: 'Profile not found' };
  }

  // Get assignments where user is the sitter (by email or id)
  const { data: assignments, error } = await supabase
    .from('sitter_assignments')
    .select(`
      *,
      pets(id, name, species, photo_url),
      profiles!sitter_assignments_owner_id_fkey(full_name, email)
    `)
    .or(`sitter_email.eq.${profile.email},sitter_id.eq.${user.id}`)
    .in('status', ['pending', 'accepted'])
    .gte('end_date', new Date().toISOString().split('T')[0])
    .order('start_date', { ascending: true });

  if (error) {
    return { assignments: [], error: error.message };
  }

  return { assignments: assignments || [], error: null };
}

export async function getOwnerAssignments() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { assignments: [], error: 'Not authenticated' };
  }

  const { data: assignments, error } = await supabase
    .from('sitter_assignments')
    .select(`
      *,
      pets(id, name, species, photo_url)
    `)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return { assignments: [], error: error.message };
  }

  return { assignments: assignments || [], error: null };
}
