'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { deleteMedication } from '@/lib/actions/medications';

export function DeleteMedicationButton({
  petId,
  medicationId,
  medicationName,
}: {
  petId: string;
  medicationId: string;
  medicationName: string;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteMedication(petId, medicationId);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  if (showConfirm) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-red-500">
          Delete {medicationName}? This will also delete all dose logs.
        </p>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? 'Deleting...' : 'Confirm Delete'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfirm(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <Button
      variant="destructive"
      onClick={() => setShowConfirm(true)}
    >
      Delete Medication
    </Button>
  );
}
