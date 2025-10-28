import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient();
  
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
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>{pet.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {pet.species} {pet.breed && `• ${pet.breed}`}
                  </p>
                  <p className="text-sm mt-2">
                    {pet.medications?.[0]?.count || 0} active medication(s)
                  </p>
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