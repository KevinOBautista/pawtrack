import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DeletePetButton } from '@/components/delete-pet-button';

export default async function PetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch pet with medications
  const { data: pet, error } = await supabase
    .from('pets')
    .select('*, medications(id, name, dosage, frequency, start_date, end_date)')
    .eq('id', id)
    .single();

  if (error || !pet) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{pet.name}</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/pets/${pet.id}/edit`}>Edit Pet</Link>
          </Button>
          <DeletePetButton petId={pet.id} petName={pet.name} />
        </div>
      </div>

      {/* Pet Photo */}
      {pet.photo_url && (
        <Card>
          <CardContent className="p-6">
            <img
              src={pet.photo_url}
              alt={pet.name}
              className="w-full max-w-md mx-auto rounded-lg object-cover"
            />
          </CardContent>
        </Card>
      )}

      {/* Pet Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Pet Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Species</dt>
              <dd className="mt-1">{pet.species}</dd>
            </div>
            {pet.breed && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Breed</dt>
                <dd className="mt-1">{pet.breed}</dd>
              </div>
            )}
            {pet.age !== null && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Age</dt>
                <dd className="mt-1">{pet.age} years</dd>
              </div>
            )}
            {pet.weight !== null && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Weight</dt>
                <dd className="mt-1">{pet.weight} lbs</dd>
              </div>
            )}
            {pet.notes && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
                <dd className="mt-1 whitespace-pre-wrap">{pet.notes}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Medications Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Medications</CardTitle>
            <Button asChild size="sm">
              <Link href={`/pets/${pet.id}/medications/new`}>
                Add Medication
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {pet.medications && pet.medications.length > 0 ? (
            <div className="space-y-4">
              {pet.medications.map((med: any) => (
                <Link
                  key={med.id}
                  href={`/pets/${pet.id}/medications/${med.id}`}
                  className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{med.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {med.dosage} • {med.frequency}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(med.start_date).toLocaleDateString()}
                      {med.end_date && ` - ${new Date(med.end_date).toLocaleDateString()}`}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No medications yet.{' '}
              <Link
                href={`/pets/${pet.id}/medications/new`}
                className="text-primary hover:underline"
              >
                Add the first medication
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
