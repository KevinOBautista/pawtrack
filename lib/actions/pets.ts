'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPet(formData: FormData) {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Extract form data
  const name = formData.get('name') as string;
  const species = formData.get('species') as string;
  const breed = formData.get('breed') as string | null;
  const ageStr = formData.get('age') as string | null;
  const weightStr = formData.get('weight') as string | null;
  const notes = formData.get('notes') as string | null;
  const photo_url = formData.get('photo_url') as string | null;

  const age = ageStr && ageStr.trim() !== '' ? Number(ageStr) : null;
  const weight = weightStr && weightStr.trim() !== '' ? Number(weightStr) : null;

  // Validation
  if (!name || !species) {
    return { error: 'Name and species are required' };
  }

  // Insert pet
  const { data: pet, error } = await supabase
    .from('pets')
    .insert({
      owner_id: user.id,
      name,
      species,
      breed: breed || null,
      age,
      weight,
      notes: notes || null,
      photo_url: photo_url || null,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/pets');
  redirect(`/pets/${pet.id}`);
}

export async function updatePet(petId: string, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const name = formData.get('name') as string;
  const species = formData.get('species') as string;
  const breed = formData.get('breed') as string | null;
  const ageStr = formData.get('age') as string | null;
  const weightStr = formData.get('weight') as string | null;
  const notes = formData.get('notes') as string | null;
  const photo_url = formData.get('photo_url') as string | null;

  const age = ageStr && ageStr.trim() !== '' ? Number(ageStr) : null;
  const weight = weightStr && weightStr.trim() !== '' ? Number(weightStr) : null;

  if (!name || !species) {
    return { error: 'Name and species are required' };
  }

  const { error } = await supabase
    .from('pets')
    .update({
      name,
      species,
      breed: breed || null,
      age,
      weight,
      notes: notes || null,
      photo_url: photo_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', petId)
    .eq('owner_id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/pets');
  revalidatePath(`/pets/${petId}`);
  redirect(`/pets/${petId}`);
}

export async function deletePet(petId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', petId)
    .eq('owner_id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/pets');
  redirect('/pets');
}
