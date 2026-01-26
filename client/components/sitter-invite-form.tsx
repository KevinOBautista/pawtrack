'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { inviteSitter } from '@/lib/actions/sitter-assignments';

interface Pet {
  id: string;
  name: string;
}

interface SitterInviteFormProps {
  pets: Pet[];
  preselectedPetId?: string;
}

export function SitterInviteForm({ pets, preselectedPetId }: SitterInviteFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedPetId, setSelectedPetId] = useState(preselectedPetId || '');

  // Default dates: today to 7 days from now
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!selectedPetId) {
      setError('Please select a pet');
      return;
    }

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await inviteSitter(selectedPetId, formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite a Pet Sitter</CardTitle>
        <CardDescription>
          Send an invitation to someone who will help care for your pet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            {/* Pet Selection */}
            <div className="grid gap-2">
              <Label htmlFor="pet">
                Pet <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedPetId} onValueChange={setSelectedPetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a pet" />
                </SelectTrigger>
                <SelectContent>
                  {pets.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id}>
                      {pet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sitter Email */}
            <div className="grid gap-2">
              <Label htmlFor="sitter_email">
                Sitter Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sitter_email"
                name="sitter_email"
                type="email"
                placeholder="sitter@example.com"
                required
              />
              <p className="text-xs text-muted-foreground">
                They&apos;ll receive an invitation to create an account if needed
              </p>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  required
                  defaultValue={today}
                  min={today}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end_date">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  required
                  defaultValue={nextWeek}
                  min={today}
                />
              </div>
            </div>

            {/* Error Display */}
            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Sending Invitation...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
