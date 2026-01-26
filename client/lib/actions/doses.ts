'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function markDoseAsGiven(doseId: string, formData?: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Get the dose log
  const { data: dose, error: doseError } = await supabase
    .from('dose_logs')
    .select(`
      *,
      medications(pet_id, pets(owner_id))
    `)
    .eq('id', doseId)
    .single();

  if (doseError || !dose) {
    return { error: 'Dose not found' };
  }

  // Verify user has permission (is owner or assigned sitter)
  const petId = dose.medications?.pet_id;
  const ownerId = dose.medications?.pets?.owner_id;

  // Check if user is owner
  const isOwner = ownerId === user.id;

  // Check if user is assigned sitter
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single();

  let isSitter = false;
  if (profile && petId) {
    const { data: assignment } = await supabase
      .from('sitter_assignments')
      .select('id')
      .eq('pet_id', petId)
      .or(`sitter_email.eq.${profile.email},sitter_id.eq.${user.id}`)
      .eq('status', 'accepted')
      .lte('start_date', new Date().toISOString().split('T')[0])
      .gte('end_date', new Date().toISOString().split('T')[0])
      .single();

    isSitter = !!assignment;
  }

  if (!isOwner && !isSitter) {
    return { error: 'Access denied' };
  }

  // Extract optional notes from form
  const notes = formData?.get('notes') as string | null;

  // Update the dose log
  const { error } = await supabase
    .from('dose_logs')
    .update({
      status: 'administered',
      sitter_id: user.id,
      administered_time: new Date().toISOString(),
      notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', doseId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/sitters');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function markDoseAsMissed(doseId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Get the dose log
  const { data: dose, error: doseError } = await supabase
    .from('dose_logs')
    .select(`
      *,
      medications(pet_id, pets(owner_id))
    `)
    .eq('id', doseId)
    .single();

  if (doseError || !dose) {
    return { error: 'Dose not found' };
  }

  const ownerId = dose.medications?.pets?.owner_id;

  // Only owner can mark as missed
  if (ownerId !== user.id) {
    return { error: 'Only the pet owner can mark doses as missed' };
  }

  const { error } = await supabase
    .from('dose_logs')
    .update({
      status: 'missed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', doseId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/sitters');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function undoDose(doseId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Get the dose log
  const { data: dose, error: doseError } = await supabase
    .from('dose_logs')
    .select(`
      *,
      medications(pet_id, pets(owner_id))
    `)
    .eq('id', doseId)
    .single();

  if (doseError || !dose) {
    return { error: 'Dose not found' };
  }

  const ownerId = dose.medications?.pets?.owner_id;

  // Only owner or the sitter who administered can undo
  if (ownerId !== user.id && dose.sitter_id !== user.id) {
    return { error: 'Access denied' };
  }

  const { error } = await supabase
    .from('dose_logs')
    .update({
      status: 'pending',
      sitter_id: null,
      administered_time: null,
      notes: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', doseId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/sitters');
  revalidatePath('/dashboard');
  return { success: true };
}
