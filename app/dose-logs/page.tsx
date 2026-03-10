"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, XCircle, Clock, Search, Filter } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion } from "motion/react";
import { format } from "date-fns";

const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string; border: string }> = {
  administered: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100", label: "Given", border: "border-green-200" },
  missed: { icon: XCircle, color: "text-red-500", bg: "bg-red-100", label: "Missed", border: "border-red-200" },
  pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-100", label: "Pending", border: "border-amber-200" },
};

export default function DoseLogsPage() {
  const [doseLogs, setDoseLogs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("dose_logs")
      .select("*, medications(name, dosage), pets(name, species)")
      .order("scheduled_time", { ascending: false })
      .limit(100);
    setDoseLogs(data || []);
    setLoading(false);
  };

  const handleMarkStatus = async (id: string, status: "administered" | "missed") => {
    const supabase = createClient();
    await supabase.from("dose_logs").update({
      status,
      administered_time: status === "administered" ? new Date().toISOString() : null,
    }).eq("id", id);
    showToast(status === "administered" ? "Dose marked as given ✅" : "Dose marked as missed ⚠️");
    loadData();
  };

  const filtered = doseLogs.filter((l) => {
    const matchSearch = (l.medications as any)?.name?.toLowerCase().includes(search.toLowerCase()) ||
      (l.pets as any)?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const todayStr = new Date().toISOString().split("T")[0];
  const todayLogs = filtered.filter((l) => l.scheduled_time?.startsWith(todayStr));
  const olderLogs = filtered.filter((l) => !l.scheduled_time?.startsWith(todayStr));

  const LogCard = ({ log }: { log: any }) => {
    const cfg = statusConfig[log.status] || statusConfig.pending;
    const StatusIcon = cfg.icon;
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-2xl border ${cfg.border} shadow-sm p-4 hover:shadow-md transition-all`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 ${cfg.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <StatusIcon className={`w-5 h-5 ${cfg.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{(log.medications as any)?.name || "Unknown"}</p>
                <p className="text-slate-500 text-sm">{(log.pets as any)?.name} · {(log.medications as any)?.dosage}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color} flex-shrink-0`}>
                {cfg.label}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-slate-400">
                {log.scheduled_time ? format(new Date(log.scheduled_time), "MMM d, h:mm a") : ""}
              </span>
              {log.notes && <span className="text-xs text-slate-400 truncate">· {log.notes}</span>}
            </div>
            {log.status === "pending" && (
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleMarkStatus(log.id, "administered")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-all border border-green-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark Given
                </button>
                <button onClick={() => handleMarkStatus(log.id, "missed")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-medium hover:bg-red-200 transition-all border border-red-200">
                  <XCircle className="w-3.5 h-3.5" /> Mark Missed
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      {toast && <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium">{toast}</div>}

      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all shadow-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Dose Logs</h1>
          <p className="text-slate-500 text-sm mt-0.5">{doseLogs.filter((l) => l.status === "pending").length} pending · {doseLogs.filter((l) => l.status === "administered").length} given</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by medication or pet..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="administered">Given</option>
          <option value="missed">Missed</option>
        </select>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <div className="text-5xl mb-3">📋</div>
          <h3 className="font-bold text-slate-800 mb-1">No dose logs found</h3>
          <p className="text-slate-400 text-sm">Dose logs are created automatically when medications are scheduled.</p>
        </div>
      )}

      {todayLogs.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500" /> Today
          </h2>
          <div className="space-y-3">
            {todayLogs.map((log) => <LogCard key={log.id} log={log} />)}
          </div>
        </div>
      )}

      {olderLogs.length > 0 && (
        <div>
          <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-400" /> Earlier
          </h2>
          <div className="space-y-3">
            {olderLogs.map((log) => <LogCard key={log.id} log={log} />)}
          </div>
        </div>
      )}
    </div>
  );
}
