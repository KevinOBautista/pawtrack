'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { createMedication, updateMedication } from '@/lib/actions/medications';
import type { Medication } from '@/lib/types/database';
import { X, Plus } from 'lucide-react';

interface MedicationFormProps {
  petId: string;
  petName: string;
  medication?: Medication;
  mode: 'create' | 'edit';
}

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Once daily' },
  { value: 'twice_daily', label: 'Twice daily' },
  { value: 'every_other_day', label: 'Every other day' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export function MedicationForm({ petId, petName, medication, mode }: MedicationFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [frequency, setFrequency] = useState(medication?.frequency || 'daily');
  const [times, setTimes] = useState<string[]>(
    medication?.time_of_day || ['08:00']
  );
  const router = useRouter();

  const addTime = () => {
    setTimes([...times, '12:00']);
  };

  const removeTime = (index: number) => {
    if (times.length > 1) {
      setTimes(times.filter((_, i) => i !== index));
    }
  };

  const updateTime = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('frequency', frequency);
    formData.set('time_of_day', JSON.stringify(times));

    startTransition(async () => {
      let result;
      if (mode === 'edit' && medication) {
        result = await updateMedication(petId, medication.id, formData);
      } else {
        result = await createMedication(petId, formData);
      }

      if (result?.error) {
        setError(result.error);
      }
    });
  };

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateStr: string | null | undefined) => {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Add Medication' : 'Edit Medication'}
        </CardTitle>
        <CardDescription>
          {mode === 'create'
            ? `Add a new medication for ${petName}`
            : `Update medication details for ${petName}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            {/* Medication Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">
                Medication Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="e.g., Amoxicillin"
                required
                defaultValue={medication?.name}
              />
            </div>

            {/* Dosage */}
            <div className="grid gap-2">
              <Label htmlFor="dosage">
                Dosage <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dosage"
                name="dosage"
                type="text"
                placeholder="e.g., 250mg, 1 tablet, 5ml"
                required
                defaultValue={medication?.dosage}
              />
            </div>

            {/* Frequency */}
            <div className="grid gap-2">
              <Label htmlFor="frequency">
                Frequency <span className="text-red-500">*</span>
              </Label>
              <Select
                value={frequency}
                onValueChange={setFrequency}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Times */}
            <div className="grid gap-2">
              <Label>
                Time(s) of Day <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-2">
                {times.map((time, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => updateTime(index, e.target.value)}
                      className="flex-1"
                    />
                    {times.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTime(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTime}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Time
                </Button>
              </div>
            </div>

            {/* Start Date */}
            <div className="grid gap-2">
              <Label htmlFor="start_date">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                required
                defaultValue={formatDateForInput(medication?.start_date) || today}
              />
            </div>

            {/* End Date */}
            <div className="grid gap-2">
              <Label htmlFor="end_date">End Date (optional)</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                defaultValue={formatDateForInput(medication?.end_date)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for ongoing medication
              </p>
            </div>

            {/* Instructions */}
            <div className="grid gap-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                name="instructions"
                placeholder="e.g., Give with food, shake well before use..."
                rows={3}
                defaultValue={medication?.instructions || ''}
              />
            </div>

            {/* Error Display */}
            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending
                  ? mode === 'create'
                    ? 'Adding Medication...'
                    : 'Updating Medication...'
                  : mode === 'create'
                  ? 'Add Medication'
                  : 'Update Medication'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
