'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { markDoseAsGiven, undoDose } from '@/lib/actions/doses';
import { Check, Undo2, Clock } from 'lucide-react';

interface DoseCardProps {
  dose: {
    id: string;
    scheduled_time: string;
    status: 'pending' | 'administered' | 'missed';
    administered_time: string | null;
    notes: string | null;
    medications: {
      id: string;
      name: string;
      dosage: string;
      instructions: string | null;
      pets: {
        id: string;
        name: string;
        species: string;
        photo_url: string | null;
      };
    };
  };
}

export function DoseCard({ dose }: DoseCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const scheduledTime = new Date(dose.scheduled_time);
  const isOverdue = dose.status === 'pending' && scheduledTime < new Date();

  const handleMarkAsGiven = () => {
    setError(null);
    const formData = new FormData();
    if (notes) {
      formData.set('notes', notes);
    }

    startTransition(async () => {
      const result = await markDoseAsGiven(dose.id, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setShowNotes(false);
        setNotes('');
      }
    });
  };

  const handleUndo = () => {
    setError(null);
    startTransition(async () => {
      const result = await undoDose(dose.id);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  const statusColors: Record<string, 'default' | 'secondary' | 'destructive'> = {
    pending: 'secondary',
    administered: 'default',
    missed: 'destructive',
  };

  return (
    <Card className={isOverdue ? 'border-orange-500' : ''}>
      <CardContent className="py-4">
        <div className="flex items-start gap-4">
          {/* Pet Photo */}
          {dose.medications.pets.photo_url ? (
            <img
              src={dose.medications.pets.photo_url}
              alt={dose.medications.pets.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
              <span className="text-2xl">
                {dose.medications.pets.species === 'dog' ? '🐕' :
                 dose.medications.pets.species === 'cat' ? '🐈' : '🐾'}
              </span>
            </div>
          )}

          {/* Dose Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{dose.medications.pets.name}</h3>
                <p className="text-lg">{dose.medications.name}</p>
                <p className="text-sm text-muted-foreground">
                  {dose.medications.dosage}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className={isOverdue ? 'text-orange-500 font-medium' : ''}>
                    {scheduledTime.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <Badge variant={statusColors[dose.status]} className="mt-1">
                  {dose.status}
                </Badge>
              </div>
            </div>

            {/* Instructions */}
            {dose.medications.instructions && (
              <p className="text-sm text-muted-foreground mt-2 italic">
                {dose.medications.instructions}
              </p>
            )}

            {/* Administered info */}
            {dose.status === 'administered' && dose.administered_time && (
              <p className="text-sm text-green-600 mt-2">
                Given at {new Date(dose.administered_time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {dose.notes && ` - ${dose.notes}`}
              </p>
            )}

            {/* Actions */}
            <div className="mt-4">
              {dose.status === 'pending' && (
                <>
                  {showNotes ? (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Add notes (optional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleMarkAsGiven}
                          disabled={isPending}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          {isPending ? 'Saving...' : 'Confirm Given'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowNotes(false);
                            setNotes('');
                          }}
                          disabled={isPending}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setShowNotes(true)}
                      disabled={isPending}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Mark as Given
                    </Button>
                  )}
                </>
              )}

              {dose.status === 'administered' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleUndo}
                  disabled={isPending}
                >
                  <Undo2 className="h-4 w-4 mr-1" />
                  {isPending ? 'Undoing...' : 'Undo'}
                </Button>
              )}
            </div>

            {/* Error Display */}
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
