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
import { Badge } from '@/components/ui/badge';
import { DeleteMedicationButton } from '@/components/delete-medication-button';

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Once daily',
  twice_daily: 'Twice daily',
  every_other_day: 'Every other day',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

export default async function MedicationDetailPage({
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

  // Fetch recent dose logs
  const { data: doseLogs } = await supabase
    .from('dose_logs')
    .select('*')
    .eq('medication_id', medId)
    .order('scheduled_time', { ascending: false })
    .limit(10);

  // Check if medication is active
  const now = new Date();
  const startDate = new Date(medication.start_date);
  const endDate = medication.end_date ? new Date(medication.end_date) : null;
  const isActive = startDate <= now && (!endDate || endDate >= now);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:underline">
          Dashboard
        </Link>
        {' / '}
        <Link href={`/pets/${petId}`} className="hover:underline">
          {pet.name}
        </Link>
        {' / '}
        <span>{medication.name}</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{medication.name}</h1>
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/pets/${petId}/medications/${medId}/edit`}>
              Edit
            </Link>
          </Button>
          <DeleteMedicationButton
            petId={petId}
            medicationId={medId}
            medicationName={medication.name}
          />
        </div>
      </div>

      {/* Medication Details */}
      <Card>
        <CardHeader>
          <CardTitle>Medication Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Dosage</dt>
              <dd className="mt-1">{medication.dosage}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Frequency</dt>
              <dd className="mt-1">
                {FREQUENCY_LABELS[medication.frequency] || medication.frequency}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Time(s)</dt>
              <dd className="mt-1">
                {medication.time_of_day.map((time: string) => (
                  <Badge key={time} variant="outline" className="mr-1">
                    {time}
                  </Badge>
                ))}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Start Date</dt>
              <dd className="mt-1">
                {new Date(medication.start_date).toLocaleDateString()}
              </dd>
            </div>
            {medication.end_date && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">End Date</dt>
                <dd className="mt-1">
                  {new Date(medication.end_date).toLocaleDateString()}
                </dd>
              </div>
            )}
            {medication.instructions && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">Instructions</dt>
                <dd className="mt-1 whitespace-pre-wrap">{medication.instructions}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Recent Doses */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Doses</CardTitle>
        </CardHeader>
        <CardContent>
          {doseLogs && doseLogs.length > 0 ? (
            <div className="space-y-3">
              {doseLogs.map((dose: any) => (
                <div
                  key={dose.id}
                  className="flex justify-between items-center p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {new Date(dose.scheduled_time).toLocaleDateString()}{' '}
                      at{' '}
                      {new Date(dose.scheduled_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {dose.notes && (
                      <p className="text-sm text-muted-foreground">{dose.notes}</p>
                    )}
                  </div>
                  <Badge
                    variant={
                      dose.status === 'administered'
                        ? 'default'
                        : dose.status === 'missed'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {dose.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No dose logs yet. Doses will appear here once scheduled.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
