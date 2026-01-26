import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/profile-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // If no profile, redirect to setup
  if (!profile) {
    redirect('/profile/setup');
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <Badge variant={profile.role === 'owner' ? 'default' : 'secondary'}>
          {profile.role === 'owner' ? 'Pet Owner' : 'Pet Sitter'}
        </Badge>
      </div>

      {/* Profile Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Member since {new Date(profile.created_at).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Email</dt>
              <dd className="mt-1">{profile.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Full Name</dt>
              <dd className="mt-1">{profile.full_name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Phone Number</dt>
              <dd className="mt-1">
                {profile.phone_number || (
                  <span className="text-muted-foreground italic">Not set</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Role</dt>
              <dd className="mt-1 capitalize">{profile.role}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      <ProfileForm profile={profile} userEmail={user.email!} mode="edit" />
    </div>
  );
}
