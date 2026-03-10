import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { PetForm } from '@/components/pet-form';

export default async function EditPetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: pet, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !pet) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PetForm pet={pet} mode="edit" />
    </div>
  );
}
