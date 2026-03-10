import { createClient } from '@/lib/supabase/server';
import { PetsPageClient } from '@/components/pets-page-client';

export default async function PetsPage() {
  const supabase = await createClient();

  const [{ data: pets }, { data: doseLogs }] = await Promise.all([
    supabase
      .from('pets')
      .select('*, medications(count)')
      .order('created_at', { ascending: false }),
    supabase
      .from('dose_logs')
      .select('id, status, scheduled_time, medications!inner(pet_id)')
      .gte('scheduled_time', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('scheduled_time', { ascending: false }),
  ]);

  return <PetsPageClient initialPets={pets || []} doseLogs={doseLogs || []} />;
}
