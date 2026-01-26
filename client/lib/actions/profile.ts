'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { UserRole } from '@/lib/types/database';

export async function createProfile(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (existingProfile) {
    return { error: 'Profile already exists' };
  }

  const full_name = formData.get('full_name') as string;
  const phone_number = formData.get('phone_number') as string | null;
  const role = formData.get('role') as UserRole;

  if (!full_name || !role) {
    return { error: 'Full name and role are required' };
  }

  if (!['owner', 'sitter'].includes(role)) {
    return { error: 'Invalid role selected' };
  }

  const { error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      email: user.email!,
      full_name,
      phone_number: phone_number || null,
      role,
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const full_name = formData.get('full_name') as string;
  const phone_number = formData.get('phone_number') as string | null;
  const role = formData.get('role') as UserRole;

  if (!full_name || !role) {
    return { error: 'Full name and role are required' };
  }

  if (!['owner', 'sitter'].includes(role)) {
    return { error: 'Invalid role selected' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name,
      phone_number: phone_number || null,
      role,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/profile');
  revalidatePath('/dashboard');
  redirect('/profile');
}

export async function getProfile() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}
