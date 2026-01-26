'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  acceptAssignment,
  declineAssignment,
  revokeAssignment,
} from '@/lib/actions/sitter-assignments';

interface AssignmentActionsProps {
  assignmentId: string;
  type: 'invitation' | 'owner';
}

export function AssignmentActions({ assignmentId, type }: AssignmentActionsProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleAccept = () => {
    startTransition(async () => {
      const result = await acceptAssignment(assignmentId);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  const handleDecline = () => {
    startTransition(async () => {
      const result = await declineAssignment(assignmentId);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  const handleRevoke = () => {
    startTransition(async () => {
      const result = await revokeAssignment(assignmentId);
      if (result?.error) {
        setError(result.error);
      }
      setShowConfirm(false);
    });
  };

  if (type === 'invitation') {
    return (
      <div className="flex flex-col items-end gap-2">
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleAccept}
            disabled={isPending}
          >
            {isPending ? 'Processing...' : 'Accept'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDecline}
            disabled={isPending}
          >
            Decline
          </Button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  // Owner view - revoke assignment
  if (showConfirm) {
    return (
      <div className="flex flex-col items-end gap-2">
        <p className="text-xs text-muted-foreground">Remove this assignment?</p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={handleRevoke}
            disabled={isPending}
          >
            {isPending ? 'Removing...' : 'Confirm'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowConfirm(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => setShowConfirm(true)}
    >
      Remove
    </Button>
  );
}
