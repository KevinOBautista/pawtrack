import { PetForm } from '@/components/pet-form';

export default function AddPetPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <PetForm mode="create" />
    </div>
  );
}
