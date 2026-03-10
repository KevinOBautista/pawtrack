import { createClient } from "@/lib/supabase/server";
import { PawPrint, Pill, ClipboardList, CheckCircle2, XCircle, Clock, TrendingUp, AlertTriangle, Plus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

const SPECIES_EMOJI: Record<string, string> = {
  Dog: "🐕", Cat: "🐈", Bird: "🦜", Rabbit: "🐇", Fish: "🐠", Hamster: "🐹", default: "🐾",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: pets }, { data: medications }, { data: doseLogs }] = await Promise.all([
    supabase.from("pets").select("*").order("created_at", { ascending: false }),
    supabase.from("medications").select("*").order("created_at", { ascending: false }),
    supabase.from("dose_logs").select("*, medications(name, dosage), pets(name)").order("scheduled_time", { ascending: false }).limit(50),
  ]);

  const today = new Date().toISOString().split("T")[0];
  const todayLogs = (doseLogs || []).filter((l) => l.scheduled_time?.startsWith(today));
  const givenToday = todayLogs.filter((l) => l.status === "administered").length;
  const missedToday = todayLogs.filter((l) => l.status === "missed").length;
  const pendingToday = todayLogs.filter((l) => l.status === "pending").length;
  const activeMeds = (medications || []).length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.email?.split("@")[0]?.split(".")?.[0] || "there";

  const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    administered: { color: "text-green-600", bg: "bg-green-100", label: "Given" },
    missed: { color: "text-red-500", bg: "bg-red-100", label: "Missed" },
    pending: { color: "text-amber-500", bg: "bg-amber-100", label: "Pending" },
  };

  const stats = [
    { label: "My Pets", value: pets?.length || 0, icon: PawPrint, gradient: "from-teal-500 to-teal-700", to: "/pets" },
    { label: "Active Meds", value: activeMeds, icon: Pill, gradient: "from-violet-500 to-purple-700", to: "/medications" },
    { label: "Doses Today", value: givenToday, sub: `of ${todayLogs.length}`, icon: CheckCircle2, gradient: "from-green-500 to-emerald-700", to: "/dose-logs" },
    { label: "Pending Doses", value: pendingToday, icon: Clock, gradient: "from-amber-500 to-orange-600", to: "/dose-logs" },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {greeting}, {firstName}! 👋
            </h1>
            <p className="text-slate-500 mt-1">
              {format(new Date(), "EEEE, MMMM d, yyyy")} · Here&apos;s your pet health overview
            </p>
          </div>
          <Link
            href="/pets/new"
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all text-sm font-medium shadow-lg shadow-teal-600/20"
          >
            <Plus className="w-4 h-4" /> Add Pet
          </Link>
        </div>
      </div>

      {/* Missed Dose Alert */}
      {missedToday > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-800">⚠️ {missedToday} missed dose{missedToday > 1 ? "s" : ""} today</p>
            <p className="text-red-600 text-sm">Some medications were not administered on schedule.</p>
          </div>
          <Link href="/dose-logs" className="text-red-600 hover:text-red-700 text-sm font-semibold border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-all">
            View Logs
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.to}
            className={`bg-gradient-to-br ${s.gradient} rounded-2xl p-4 shadow-lg text-left group overflow-hidden relative block`}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-3xl font-black text-white leading-none">
                {s.value}
                {s.sub && <span className="text-sm text-white/70 font-normal ml-1">{s.sub}</span>}
              </div>
              <div className="text-sm text-white/80 mt-0.5 font-medium">{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Pets */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">My Pets</h2>
            <Link href="/pets" className="text-teal-600 hover:text-teal-700 text-sm font-medium">View all →</Link>
          </div>
          {!pets || pets.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🐾</div>
              <p className="text-slate-500 text-sm">No pets added yet</p>
              <Link href="/pets/new" className="mt-3 text-teal-600 text-sm font-medium hover:underline block">Add your first pet</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {pets.slice(0, 4).map((pet) => {
                const petMeds = (medications || []).filter((m) => m.pet_id === pet.id);
                return (
                  <Link key={pet.id} href={`/pets/${pet.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-xl flex-shrink-0">
                      {SPECIES_EMOJI[pet.species] || SPECIES_EMOJI.default}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm">{pet.name}</p>
                      <p className="text-slate-400 text-xs">{pet.breed || pet.species}{pet.age ? ` · ${pet.age}yr` : ""}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-teal-600">{petMeds.length} meds</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Today&apos;s Schedule</h2>
            <Link href="/dose-logs" className="text-teal-600 hover:text-teal-700 text-sm font-medium">View all →</Link>
          </div>
          {todayLogs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-slate-500 text-sm">No doses scheduled today</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayLogs.slice(0, 6).map((log) => {
                const cfg = statusConfig[log.status] || statusConfig.pending;
                const StatusIcon = log.status === "administered" ? CheckCircle2 : log.status === "missed" ? XCircle : Clock;
                return (
                  <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all">
                    <div className={`w-8 h-8 ${cfg.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <StatusIcon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate">{(log.medications as any)?.name || "Unknown"}</p>
                      <p className="text-slate-400 text-xs">{(log.pets as any)?.name} · {(log.medications as any)?.dosage}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Recent Activity</h2>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          {!doseLogs || doseLogs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-slate-500 text-sm">No activity yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {doseLogs.slice(0, 5).map((log) => {
                const cfg = statusConfig[log.status] || statusConfig.pending;
                return (
                  <div key={log.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      log.status === "administered" ? "bg-green-500" : log.status === "missed" ? "bg-red-500" : "bg-amber-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800">
                        <span className="font-medium">{(log.pets as any)?.name}</span> — {(log.medications as any)?.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-400">
                          {log.scheduled_time ? format(new Date(log.scheduled_time), "MMM d, h:mm a") : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #14b8a6 0%, transparent 50%), radial-gradient(circle at 80% 50%, #6366f1 0%, transparent 50%)" }} />
        <div className="relative">
          <h2 className="font-bold mb-4 text-lg">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: "🐾", label: "Add New Pet", to: "/pets/new" },
              { icon: "💊", label: "Add Medication", to: "/medications" },
              { icon: "📋", label: "Log a Dose", to: "/dose-logs" },
              { icon: "🗺️", label: "Find a Vet", to: "/vet-finder" },
            ].map((action) => (
              <Link key={action.label} href={action.to}
                className="flex flex-col items-center gap-2 p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 hover:border-white/30 backdrop-blur">
                <span className="text-3xl">{action.icon}</span>
                <span className="text-xs font-semibold text-center leading-tight text-white/90">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
