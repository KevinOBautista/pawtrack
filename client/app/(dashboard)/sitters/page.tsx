import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AssignmentActions } from '@/components/assignment-actions';
import { DoseCard } from '@/components/dose-card';

export default async function SittersPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  // Get user's profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/profile/setup');
  }

  const isOwner = profile.role === 'owner';
  const isSitter = profile.role === 'sitter';
  const userEmail = profile.email?.toLowerCase() || '';

  // For owners: get their sitter assignments (who they've invited)
  let ownerAssignments: any[] = [];
  if (isOwner) {
    const { data } = await supabase
      .from('sitter_assignments')
      .select(`
        *,
        pets(id, name, species, photo_url)
      `)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });
    ownerAssignments = data || [];
  }

  // Get active sitting assignments (pets the user is sitting)
  // Query by sitter_id first, then by email
  let activeSittingAssignments: any[] = [];

  const { data: assignmentsBySitterId } = await supabase
    .from('sitter_assignments')
    .select(`
      *,
      pets(id, name, species, photo_url, owner_id, medications(id, name))
    `)
    .eq('sitter_id', user.id)
    .eq('status', 'accepted')
    .lte('start_date', new Date().toISOString().split('T')[0])
    .gte('end_date', new Date().toISOString().split('T')[0]);

  const { data: assignmentsByEmail } = await supabase
    .from('sitter_assignments')
    .select(`
      *,
      pets(id, name, species, photo_url, owner_id, medications(id, name))
    `)
    .ilike('sitter_email', userEmail)
    .eq('status', 'accepted')
    .lte('start_date', new Date().toISOString().split('T')[0])
    .gte('end_date', new Date().toISOString().split('T')[0]);

  // Combine and dedupe
  const allAssignments = [...(assignmentsBySitterId || []), ...(assignmentsByEmail || [])];
  const seenIds = new Set();
  activeSittingAssignments = allAssignments.filter((a) => {
    if (seenIds.has(a.id)) return false;
    seenIds.add(a.id);
    return true;
  });

  // Get pet IDs the user can see doses for
  const assignedPetIds = activeSittingAssignments.map((a: any) => a.pet_id);

  // For owners, also include their own pets
  let ownerPetIds: string[] = [];
  if (isOwner) {
    const { data: ownerPets } = await supabase
      .from('pets')
      .select('id')
      .eq('owner_id', user.id);
    ownerPetIds = (ownerPets || []).map((p: any) => p.id);
  }

  // Combine all pet IDs the user can view
  const allPetIds = [...new Set([...assignedPetIds, ...ownerPetIds])];

  let todaysDoses: any[] = [];
  if (allPetIds.length > 0) {
    // Get today's date range
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();

    // First get medications for the pets
    const { data: medications } = await supabase
      .from('medications')
      .select('id, name, dosage, instructions, pet_id, pets(id, name, species, photo_url)')
      .in('pet_id', allPetIds);

    const medicationIds = (medications || []).map((m: any) => m.id);
    const medicationMap = (medications || []).reduce((acc: any, m: any) => {
      acc[m.id] = m;
      return acc;
    }, {});

    if (medicationIds.length > 0) {
      const { data: doses } = await supabase
        .from('dose_logs')
        .select('*')
        .in('medication_id', medicationIds)
        .gte('scheduled_time', startOfDay)
        .lte('scheduled_time', endOfDay)
        .order('scheduled_time', { ascending: true });

      // Attach medication info to each dose
      todaysDoses = (doses || []).map((dose: any) => ({
        ...dose,
        medications: medicationMap[dose.medication_id],
      })).filter((d: any) => d.medications !== null);
    }
  }

  // Get pending invitations for sitters (case-insensitive email match)
  const { data: pendingInvitations } = await supabase
    .from('sitter_assignments')
    .select(`
      *,
      pets(id, name, species, photo_url)
    `)
    .ilike('sitter_email', userEmail)
    .eq('status', 'pending');

  // Fetch owner info separately for pending invitations
  const ownerIds = [...new Set((pendingInvitations || []).map((inv: any) => inv.owner_id))];
  let ownerProfiles: Record<string, any> = {};
  if (ownerIds.length > 0) {
    const { data: owners } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', ownerIds);
    ownerProfiles = (owners || []).reduce((acc: any, owner: any) => {
      acc[owner.id] = owner;
      return acc;
    }, {});
  }

  const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'secondary',
    accepted: 'default',
    declined: 'destructive',
    expired: 'outline',
  };

  // Group doses by status for better display
  const pendingDoses = todaysDoses.filter(d => d.status === 'pending');
  const completedDoses = todaysDoses.filter(d => d.status === 'administered');
  const missedDoses = todaysDoses.filter(d => d.status === 'missed');

  return (
    <div className="space-y-8">
      {/* Pending Invitations for Sitters */}
      {(pendingInvitations?.length ?? 0) > 0 && (
        <Card className="border-primary border-2">
          <CardHeader className="bg-primary/5">
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              You have been invited to care for these pets
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {pendingInvitations?.map((invitation: any) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card"
                >
                  <div className="flex items-center gap-4">
                    {invitation.pets?.photo_url ? (
                      <img
                        src={invitation.pets.photo_url}
                        alt={invitation.pets.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-2xl">
                        {invitation.pets?.species === 'dog' ? '🐕' : invitation.pets?.species === 'cat' ? '🐈' : '🐾'}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">{invitation.pets?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        From: {ownerProfiles[invitation.owner_id]?.full_name || ownerProfiles[invitation.owner_id]?.email || 'Unknown'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invitation.start_date).toLocaleDateString()} -{' '}
                        {new Date(invitation.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <AssignmentActions
                    assignmentId={invitation.id}
                    type="invitation"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pets I'm Sitting Section - for sitters */}
      {activeSittingAssignments.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Pets I&apos;m Sitting</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSittingAssignments.map((assignment: any) => (
              <Card key={assignment.id} className="overflow-hidden">
                {assignment.pets?.photo_url && (
                  <div className="h-32 overflow-hidden">
                    <img
                      src={assignment.pets.photo_url}
                      alt={assignment.pets.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-lg">{assignment.pets?.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {assignment.pets?.species}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Until: {new Date(assignment.end_date).toLocaleDateString()}
                  </p>
                  {assignment.pets?.medications?.length > 0 && (
                    <Badge variant="secondary" className="mt-2">
                      {assignment.pets.medications.length} medication{assignment.pets.medications.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Today's Doses Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Today&apos;s Doses</h1>
          {isOwner && (
            <Button asChild>
              <Link href="/sitters/invite">Invite Sitter</Link>
            </Button>
          )}
        </div>

        {todaysDoses.length > 0 ? (
          <div className="space-y-6">
            {/* Pending Doses - most important */}
            {pendingDoses.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                  Pending ({pendingDoses.length})
                </h3>
                <div className="grid gap-4">
                  {pendingDoses.map((dose: any) => (
                    <DoseCard key={dose.id} dose={dose} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Doses */}
            {completedDoses.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  Completed ({completedDoses.length})
                </h3>
                <div className="grid gap-4">
                  {completedDoses.map((dose: any) => (
                    <DoseCard key={dose.id} dose={dose} />
                  ))}
                </div>
              </div>
            )}

            {/* Missed Doses */}
            {missedDoses.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  Missed ({missedDoses.length})
                </h3>
                <div className="grid gap-4">
                  {missedDoses.map((dose: any) => (
                    <DoseCard key={dose.id} dose={dose} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-lg">
                {allPetIds.length > 0
                  ? 'No doses scheduled for today'
                  : isSitter
                    ? 'No pets assigned to you yet. Accept an invitation to get started!'
                    : 'No pets yet. Add a pet and set up medications to see doses here.'}
              </p>
              {isOwner && allPetIds.length === 0 && (
                <Button asChild className="mt-4">
                  <Link href="/pets/new">Add Your First Pet</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Owner's Sitter Assignments Section */}
      {isOwner && (
        <div>
          <h2 className="text-2xl font-bold mb-4">My Sitter Assignments</h2>
          {ownerAssignments.length > 0 ? (
            <div className="space-y-4">
              {ownerAssignments.map((assignment: any) => (
                <Card key={assignment.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {assignment.pets?.photo_url ? (
                          <img
                            src={assignment.pets.photo_url}
                            alt={assignment.pets.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl">
                            {assignment.pets?.species === 'dog' ? '🐕' : assignment.pets?.species === 'cat' ? '🐈' : '🐾'}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold">{assignment.pets?.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Sitter: {assignment.sitter_email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(assignment.start_date).toLocaleDateString()} -{' '}
                            {new Date(assignment.end_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={statusColors[assignment.status]}>
                          {assignment.status}
                        </Badge>
                        <AssignmentActions
                          assignmentId={assignment.id}
                          type="owner"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No sitter assignments yet
                </p>
                <Button asChild>
                  <Link href="/sitters/invite">Invite Your First Sitter</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
