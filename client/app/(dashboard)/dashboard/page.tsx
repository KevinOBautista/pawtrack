import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Check if user has a profile, redirect to setup if not
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      redirect('/profile/setup');
    }
  }

  const { data: pets } = await supabase
    .from('pets')
    .select('*, medications(count)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Pets</h1>
        <Button asChild>
          <Link href="/pets/new">Add Pet</Link>
        </Button>
      </div>

      {pets && pets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <Link key={pet.id} href={`/pets/${pet.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full overflow-hidden">
                {pet.photo_url && (
                  <div className="w-full h-48 overflow-hidden">
                    <img
                      src={pet.photo_url}
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {pet.name}
                    {pet.medications?.[0]?.count > 0 && (
                      <Badge variant="secondary">
                        {pet.medications[0].count} med{pet.medications[0].count !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {pet.species}
                      {pet.breed && ` • ${pet.breed}`}
                    </p>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      {pet.age !== null && <span>{pet.age} yrs</span>}
                      {pet.weight !== null && (
                        <>
                          {pet.age !== null && <span>•</span>}
                          <span>{pet.weight} lbs</span>
                        </>
                      )}
                    </div>
                    {pet.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                        {pet.notes}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No pets yet</p>
            <Button asChild>
              <Link href="/pets/new">Add Your First Pet</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}