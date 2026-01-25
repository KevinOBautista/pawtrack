'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { deletePet } from '@/lib/actions/pets';

export function DeletePetButton({
  petId,
  petName,
}: {
  petId: string;
  petName: string;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deletePet(petId);
      if (result?.error) {
        setError(result.error);
      }
      // If no error, server action will redirect
    });
  };

  if (showConfirm) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-red-500">
          Delete {petName}? This cannot be undone.
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
      Delete Pet
    </Button>
  );
}
