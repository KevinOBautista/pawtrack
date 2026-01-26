'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createMedication(petId: string, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Verify user owns this pet
  const { data: pet, error: petError } = await supabase
    .from('pets')
    .select('id, owner_id')
    .eq('id', petId)
    .eq('owner_id', user.id)
    .single();

  if (petError || !pet) {
    return { error: 'Pet not found or access denied' };
  }

  // Extract form data
  const name = formData.get('name') as string;
  const dosage = formData.get('dosage') as string;
  const frequency = formData.get('frequency') as string;
  const instructions = formData.get('instructions') as string | null;
  const start_date = formData.get('start_date') as string;
  const end_date = formData.get('end_date') as string | null;

  // Parse time_of_day array from form
  const timesJson = formData.get('time_of_day') as string;
  let time_of_day: string[] = [];
  try {
    time_of_day = timesJson ? JSON.parse(timesJson) : [];
  } catch {
    return { error: 'Invalid time format' };
  }

  // Validation
  if (!name || !dosage || !frequency || !start_date || time_of_day.length === 0) {
    return { error: 'Name, dosage, frequency, start date, and at least one time are required' };
  }

  // Insert medication
  const { data: medication, error } = await supabase
    .from('medications')
    .insert({
      pet_id: petId,
      name,
      dosage,
      frequency,
      time_of_day,
      start_date,
      end_date: end_date || null,
      instructions: instructions || null,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Generate initial dose logs
  await generateDoseLogs(supabase, medication.id, {
    start_date,
    end_date: end_date || null,
    time_of_day,
    frequency,
  });

  revalidatePath(`/pets/${petId}`);
  revalidatePath('/dashboard');
  redirect(`/pets/${petId}/medications/${medication.id}`);
}

export async function updateMedication(petId: string, medicationId: string, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Verify user owns this pet and medication exists
  const { data: medication, error: medError } = await supabase
    .from('medications')
    .select('id, pet_id, pets!inner(owner_id)')
    .eq('id', medicationId)
    .eq('pet_id', petId)
    .single();

  if (medError || !medication || (medication.pets as any).owner_id !== user.id) {
    return { error: 'Medication not found or access denied' };
  }

  const name = formData.get('name') as string;
  const dosage = formData.get('dosage') as string;
  const frequency = formData.get('frequency') as string;
  const instructions = formData.get('instructions') as string | null;
  const start_date = formData.get('start_date') as string;
  const end_date = formData.get('end_date') as string | null;

  const timesJson = formData.get('time_of_day') as string;
  let time_of_day: string[] = [];
  try {
    time_of_day = timesJson ? JSON.parse(timesJson) : [];
  } catch {
    return { error: 'Invalid time format' };
  }

  if (!name || !dosage || !frequency || !start_date || time_of_day.length === 0) {
    return { error: 'Name, dosage, frequency, start date, and at least one time are required' };
  }

  const { error } = await supabase
    .from('medications')
    .update({
      name,
      dosage,
      frequency,
      time_of_day,
      start_date,
      end_date: end_date || null,
      instructions: instructions || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', medicationId);

  if (error) {
    return { error: error.message };
  }

  // Delete future pending doses and regenerate
  await supabase
    .from('dose_logs')
    .delete()
    .eq('medication_id', medicationId)
    .eq('status', 'pending')
    .gte('scheduled_time', new Date().toISOString());

  await generateDoseLogs(supabase, medicationId, {
    start_date,
    end_date: end_date || null,
    time_of_day,
    frequency,
  });

  revalidatePath(`/pets/${petId}`);
  revalidatePath(`/pets/${petId}/medications/${medicationId}`);
  revalidatePath('/dashboard');
  redirect(`/pets/${petId}/medications/${medicationId}`);
}

export async function deleteMedication(petId: string, medicationId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Verify ownership
  const { data: medication, error: medError } = await supabase
    .from('medications')
    .select('id, pet_id, pets!inner(owner_id)')
    .eq('id', medicationId)
    .eq('pet_id', petId)
    .single();

  if (medError || !medication || (medication.pets as any).owner_id !== user.id) {
    return { error: 'Medication not found or access denied' };
  }

  // Delete associated dose logs first
  await supabase
    .from('dose_logs')
    .delete()
    .eq('medication_id', medicationId);

  // Delete medication
  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', medicationId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/pets/${petId}`);
  revalidatePath('/dashboard');
  redirect(`/pets/${petId}`);
}

// Generate dose logs based on medication schedule
async function generateDoseLogs(
  supabase: Awaited<ReturnType<typeof createClient>>,
  medicationId: string,
  schedule: {
    start_date: string;
    end_date: string | null;
    time_of_day: string[];
    frequency: string;
  }
) {
  const { start_date, end_date, time_of_day, frequency } = schedule;

  // Generate doses for the next 30 days or until end_date
  const startDate = new Date(start_date);
  const today = new Date();
  const effectiveStart = startDate > today ? startDate : today;

  // Default to 30 days if no end date
  let endDate: Date;
  if (end_date) {
    endDate = new Date(end_date);
    // Cap at 90 days from now to avoid too many records
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90);
    if (endDate > maxDate) {
      endDate = maxDate;
    }
  } else {
    endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
  }

  const doseLogs: { medication_id: string; scheduled_time: string; status: string }[] = [];
  const currentDate = new Date(effectiveStart);
  currentDate.setHours(0, 0, 0, 0);

  while (currentDate <= endDate) {
    const shouldAddDose = shouldScheduleDose(currentDate, effectiveStart, frequency);

    if (shouldAddDose) {
      for (const time of time_of_day) {
        const [hours, minutes] = time.split(':').map(Number);
        const scheduledTime = new Date(currentDate);
        scheduledTime.setHours(hours, minutes, 0, 0);

        // Only add future doses
        if (scheduledTime > today) {
          doseLogs.push({
            medication_id: medicationId,
            scheduled_time: scheduledTime.toISOString(),
            status: 'pending',
          });
        }
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (doseLogs.length > 0) {
    await supabase.from('dose_logs').insert(doseLogs);
  }
}

function shouldScheduleDose(date: Date, startDate: Date, frequency: string): boolean {
  const daysSinceStart = Math.floor(
    (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  switch (frequency) {
    case 'daily':
      return true;
    case 'twice_daily':
      return true;
    case 'every_other_day':
      return daysSinceStart % 2 === 0;
    case 'weekly':
      return daysSinceStart % 7 === 0;
    case 'monthly':
      return date.getDate() === startDate.getDate();
    default:
      return true;
  }
}
