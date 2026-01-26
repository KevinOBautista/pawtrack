import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { MedicationForm } from '@/components/medication-form';

export default async function EditMedicationPage({
  params,
}: {
  params: Promise<{ id: string; medId: string }>;
}) {
  const { id: petId, medId } = await params;
  const supabase = await createClient();

  // Fetch medication with pet info
  const { data: medication, error } = await supabase
    .from('medications')
    .select('*, pets(id, name)')
    .eq('id', medId)
    .eq('pet_id', petId)
    .single();

  if (error || !medication) {
    notFound();
  }

  const pet = medication.pets as { id: string; name: string };

  return (
    <div className="max-w-2xl mx-auto">
      <MedicationForm
        petId={petId}
        petName={pet.name}
        medication={medication}
        mode="edit"
      />
    </div>
  );
}
