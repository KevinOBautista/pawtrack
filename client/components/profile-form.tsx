'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { createProfile, updateProfile } from '@/lib/actions/profile';
import type { Profile } from '@/lib/types/database';

interface ProfileFormProps {
  profile?: Profile | null;
  userEmail: string;
  mode: 'setup' | 'edit';
}

export function ProfileForm({ profile, userEmail, mode }: ProfileFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState(profile?.role || 'owner');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('role', role);

    startTransition(async () => {
      let result;
      if (mode === 'setup') {
        result = await createProfile(formData);
      } else {
        result = await updateProfile(formData);
      }

      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === 'setup' ? 'Complete Your Profile' : 'Edit Profile'}
        </CardTitle>
        <CardDescription>
          {mode === 'setup'
            ? 'Tell us a bit about yourself to get started'
            : 'Update your profile information'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            {/* Email (read-only) */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userEmail}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            {/* Full Name */}
            <div className="grid gap-2">
              <Label htmlFor="full_name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="John Doe"
                required
                defaultValue={profile?.full_name || ''}
              />
            </div>

            {/* Phone Number */}
            <div className="grid gap-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                name="phone_number"
                type="tel"
                placeholder="+1 (555) 123-4567"
                defaultValue={profile?.phone_number || ''}
              />
              <p className="text-xs text-muted-foreground">
                Used for SMS medication reminders
              </p>
            </div>

            {/* Role Selection */}
            <div className="grid gap-2">
              <Label htmlFor="role">
                I am a... <span className="text-red-500">*</span>
              </Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">
                    Pet Owner
                  </SelectItem>
                  <SelectItem value="sitter">
                    Pet Sitter
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {role === 'owner'
                  ? 'Manage your pets and their medications'
                  : 'Help care for pets and administer medications'}
              </p>
            </div>

            {/* Error Display */}
            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending
                ? mode === 'setup'
                  ? 'Setting up...'
                  : 'Saving...'
                : mode === 'setup'
                ? 'Complete Setup'
                : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
