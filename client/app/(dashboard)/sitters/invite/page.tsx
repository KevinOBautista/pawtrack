import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SitterInviteForm } from '@/components/sitter-invite-form';

export default async function InviteSitterPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  // Get user's pets
  const { data: pets } = await supabase
    .from('pets')
    .select('id, name')
    .eq('owner_id', user.id)
    .order('name', { ascending: true });

  if (!pets || pets.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4">No Pets Found</h1>
        <p className="text-muted-foreground mb-6">
          You need to add a pet before you can invite a sitter.
        </p>
        <Link
          href="/pets/new"
          className="text-primary hover:underline"
        >
          Add Your First Pet
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <Link
          href="/sitters"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Sitters
        </Link>
      </div>
      <SitterInviteForm pets={pets} />
    </div>
  );
}
