import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { MedicationForm } from '@/components/medication-form';

export default async function AddMedicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch pet to verify it exists and get name
  const { data: pet, error } = await supabase
    .from('pets')
    .select('id, name')
    .eq('id', id)
    .single();

  if (error || !pet) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <MedicationForm petId={pet.id} petName={pet.name} mode="create" />
    </div>
  );
}
