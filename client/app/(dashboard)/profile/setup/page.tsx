import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/profile-form';

export default async function ProfileSetupPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  // Check if profile already exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // If profile exists, redirect to dashboard
  if (profile) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <ProfileForm userEmail={user.email!} mode="setup" />
    </div>
  );
}
