"use client";

import React, { useState, useEffect } from "react";
import { Plus, Users, Edit2, Trash2, X, CheckCircle2, Clock, XCircle, ArrowLeft, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "motion/react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "text-amber-600", bg: "bg-amber-100" },
  active: { label: "Active", color: "text-green-600", bg: "bg-green-100" },
  completed: { label: "Completed", color: "text-slate-500", bg: "bg-slate-100" },
  cancelled: { label: "Cancelled", color: "text-red-500", bg: "bg-red-100" },
};

const EMPTY_FORM = {
  pet_id: "", sitters_name: "", sitters_email: "", start_date: "", end_date: "",
  notes: "", feeding_instructions: "", medication_instructions: "", emergency_contact: "",
  status: "pending",
};

export default function SittersPage() {
  const [pets, setPets] = useState<any[]>([]);
  const [sitters, setSitters] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const supabase = createClient();
    const [{ data: petsData }, { data: sittersData }] = await Promise.all([
      supabase.from("pets").select("*").order("created_at"),
      supabase.from("sitters").select("*, pets(name, species)").order("created_at", { ascending: false }),
    ]);
    setPets(petsData || []);
    setSitters(sittersData || []);
    setLoading(false);
  };

  const set = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const openAdd = () => {
    setForm({ ...EMPTY_FORM, pet_id: pets[0]?.id || "", start_date: new Date().toISOString().split("T")[0] });
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (s: any) => {
    setForm({
      pet_id: s.pet_id || "", sitters_name: s.sitters_name || "", sitters_email: s.sitters_email || "",
      start_date: s.start_date || "", end_date: s.end_date || "",
      notes: s.notes || "", feeding_instructions: s.feeding_instructions || "",
      medication_instructions: s.medication_instructions || "", emergency_contact: s.emergency_contact || "",
      status: s.status || "pending",
    });
    setEditId(s.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.sitters_name.trim()) return showToast("Sitter name is required");
    if (!form.pet_id) return showToast("Please select a pet");
    if (!form.start_date) return showToast("Start date is required");

    setSaving(true);
    const supabase = createClient();
    const data = {
      pet_id: form.pet_id, sitters_name: form.sitters_name.trim(),
      sitters_email: form.sitters_email.trim() || null,
      start_date: form.start_date, end_date: form.end_date || null,
      notes: form.notes.trim() || null, feeding_instructions: form.feeding_instructions.trim() || null,
      medication_instructions: form.medication_instructions.trim() || null,
      emergency_contact: form.emergency_contact.trim() || null,
      status: form.status, is_active: form.status === "active",
    };

    if (editId) {
      await supabase.from("sitters").update(data).eq("id", editId);
      showToast("Sitter updated!");
    } else {
      await supabase.from("sitters").insert(data);
      showToast("Sitter assignment created! 👥");
    }
    setSaving(false);
    setShowModal(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    const s = sitters.find((s) => s.id === id);
    const supabase = createClient();
    await supabase.from("sitters").delete().eq("id", id);
    showToast(`${s?.sitters_name}'s assignment removed.`);
    setDeleteConfirm(null);
    loadData();
  };

  const active = sitters.filter((s) => s.status === "active");
  const pending = sitters.filter((s) => s.status === "pending");
  const other = sitters.filter((s) => s.status === "completed" || s.status === "cancelled");

  const SitterCard = ({ sitter }: { sitter: any }) => {
    const pet = sitter.pets;
    const cfg = STATUS_CONFIG[sitter.status] || STATUS_CONFIG.pending;
    const isExpanded = expandedId === sitter.id;
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
        <div className={`h-1.5 ${sitter.status === "active" ? "bg-green-500" : sitter.status === "pending" ? "bg-amber-500" : sitter.status === "cancelled" ? "bg-red-400" : "bg-slate-300"}`} />
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-lg font-bold text-slate-600 flex-shrink-0">
                {sitter.sitters_name?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="font-bold text-slate-900">{sitter.sitters_name}</p>
                <p className="text-slate-500 text-sm">Caring for {pet?.name || "Unknown"}</p>
              </div>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-3">
            <div className="bg-slate-50 rounded-lg p-2">
              <p className="text-slate-400">Start</p>
              <p className="font-semibold text-slate-800">{sitter.start_date || "—"}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2">
              <p className="text-slate-400">End</p>
              <p className="font-semibold text-slate-800">{sitter.end_date || "—"}</p>
            </div>
          </div>

          {sitter.sitters_email && (
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <Mail className="w-3.5 h-3.5" /> {sitter.sitters_email}
            </div>
          )}
          {sitter.emergency_contact && (
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <Phone className="w-3.5 h-3.5" /> Emergency: {sitter.emergency_contact}
            </div>
          )}

          {(sitter.notes || sitter.feeding_instructions || sitter.medication_instructions) && (
            <button onClick={() => setExpandedId(isExpanded ? null : sitter.id)}
              className="text-xs text-teal-600 font-medium mb-2">
              {isExpanded ? "▲ Hide details" : "▼ Show instructions"}
            </button>
          )}
          <AnimatePresence>
            {isExpanded && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3 mb-3">
                  {sitter.notes && <p><span className="font-semibold">Notes:</span> {sitter.notes}</p>}
                  {sitter.feeding_instructions && <p><span className="font-semibold">Feeding:</span> {sitter.feeding_instructions}</p>}
                  {sitter.medication_instructions && <p><span className="font-semibold">Medications:</span> {sitter.medication_instructions}</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button onClick={() => openEdit(sitter)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all border border-slate-200">
              <Edit2 className="w-3 h-3" /> Edit
            </button>
            <button onClick={() => setDeleteConfirm(sitter.id)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-all border border-red-100">
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {toast && <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium">{toast}</div>}

      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all shadow-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Sitters</h1>
          <p className="text-slate-500 text-sm mt-0.5">{active.length} active · {pending.length} pending</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all text-sm font-semibold shadow-lg shadow-teal-600/25">
          <Plus className="w-4 h-4" /> Add Sitter
        </button>
      </div>

      {sitters.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <div className="text-5xl mb-3">👥</div>
          <h3 className="font-bold text-slate-800 mb-1">No sitter assignments yet</h3>
          <p className="text-slate-400 text-sm mb-4">Add a pet sitter to manage care when you&apos;re away.</p>
          <button onClick={openAdd} className="px-6 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 text-sm font-medium transition-all">Add Sitter</button>
        </div>
      )}

      {active.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500" /> Active</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">{active.map((s) => <SitterCard key={s.id} sitter={s} />)}</div>
        </div>
      )}
      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" /> Pending</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">{pending.map((s) => <SitterCard key={s.id} sitter={s} />)}</div>
        </div>
      )}
      {other.length > 0 && (
        <div>
          <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-400" /> Past</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">{other.map((s) => <SitterCard key={s.id} sitter={s} />)}</div>
        </div>
      )}

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="font-bold text-slate-900 mb-2">Remove Sitter?</h3>
              <p className="text-slate-500 text-sm mb-6">This will permanently remove <strong>{sitters.find((s) => s.id === deleteConfirm)?.sitters_name}</strong>&apos;s assignment.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-medium">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 text-sm font-medium">Remove</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <h2 className="font-bold text-slate-900">{editId ? "Edit Sitter" : "Add Sitter"}</h2>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center">
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Sitter Name <span className="text-red-400">*</span></label>
                    <input value={form.sitters_name} onChange={(e) => set("sitters_name", e.target.value)} placeholder="Jane Smith"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                    <input type="email" value={form.sitters_email} onChange={(e) => set("sitters_email", e.target.value)} placeholder="jane@email.com"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pet <span className="text-red-400">*</span></label>
                  <select value={form.pet_id} onChange={(e) => set("pet_id", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50">
                    <option value="">Select a pet</option>
                    {pets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date <span className="text-red-400">*</span></label>
                    <input type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
                    <input type="date" value={form.end_date} onChange={(e) => set("end_date", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => set("status", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50">
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Emergency Contact</label>
                  <input value={form.emergency_contact} onChange={(e) => set("emergency_contact", e.target.value)} placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Feeding Instructions</label>
                  <textarea value={form.feeding_instructions} onChange={(e) => set("feeding_instructions", e.target.value)} rows={2} placeholder="Feeding schedule and amounts..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Medication Instructions</label>
                  <textarea value={form.medication_instructions} onChange={(e) => set("medication_instructions", e.target.value)} rows={2} placeholder="Medication schedule and administration..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
                  <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} placeholder="Additional notes..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-medium">Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 text-sm font-medium disabled:opacity-70">
                    {saving ? "Saving..." : editId ? "Save Changes" : "Add Sitter"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
