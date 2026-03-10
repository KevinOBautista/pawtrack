"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, X, Pill, ChevronDown, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "motion/react";

const FREQUENCIES = ["Daily", "Twice Daily", "Every 8 Hours", "Weekly", "Bi-Weekly", "Monthly", "As Needed"];
const TIMES = ["Morning", "Afternoon", "Evening", "Night", "With Meals", "Before Meals"];

const EMPTY_FORM = {
  pet_id: "", name: "", dosage: "", frequency: "Daily", time_of_day: ["Morning"],
  start_date: "", end_date: "", instructions: "",
};

export default function MedicationsPage() {
  const [pets, setPets] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterPet, setFilterPet] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = createClient();
    const [{ data: petsData }, { data: medsData }] = await Promise.all([
      supabase.from("pets").select("*").order("created_at"),
      supabase.from("medications").select("*, pets(name, species)").order("created_at"),
    ]);
    setPets(petsData || []);
    setMedications(medsData || []);
    setLoading(false);
  };

  const set = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const filtered = medications.filter((m) => {
    const matchSearch = m.name?.toLowerCase().includes(search.toLowerCase()) ||
      (m.pets as any)?.name?.toLowerCase().includes(search.toLowerCase());
    const matchPet = filterPet === "all" || m.pet_id === filterPet;
    return matchSearch && matchPet;
  });

  const openAdd = () => {
    setForm({ ...EMPTY_FORM, pet_id: pets[0]?.id || "", start_date: new Date().toISOString().split("T")[0] });
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (med: any) => {
    setForm({
      pet_id: med.pet_id, name: med.name, dosage: med.dosage,
      frequency: med.frequency || "Daily",
      time_of_day: Array.isArray(med.time_of_day) ? med.time_of_day : [med.time_of_day || "Morning"],
      start_date: med.start_date || "", end_date: med.end_date || "",
      instructions: med.instructions || "",
    });
    setEditId(med.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.pet_id) return showToast("Please select a pet");
    if (!form.name.trim()) return showToast("Medication name is required");
    if (!form.dosage.trim()) return showToast("Dosage is required");

    setSaving(true);
    const supabase = createClient();
    const data = {
      pet_id: form.pet_id, name: form.name.trim(), dosage: form.dosage.trim(),
      frequency: form.frequency, time_of_day: form.time_of_day,
      start_date: form.start_date || null, end_date: form.end_date || null,
      instructions: form.instructions.trim() || null,
    };

    if (editId) {
      await supabase.from("medications").update(data).eq("id", editId);
      showToast("Medication updated! 💊");
    } else {
      await supabase.from("medications").insert(data);
      showToast("Medication added! 💊");
    }
    setSaving(false);
    setShowModal(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    const med = medications.find((m) => m.id === id);
    const supabase = createClient();
    await supabase.from("medications").delete().eq("id", id);
    showToast(`${med?.name} removed.`);
    setDeleteConfirm(null);
    loadData();
  };

  const byPet = pets.map((pet) => ({
    pet,
    meds: filtered.filter((m) => m.pet_id === pet.id),
  })).filter((g) => g.meds.length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all shadow-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Medications</h1>
          <p className="text-slate-500 text-sm mt-0.5">{medications.length} total medication{medications.length !== 1 ? "s" : ""}</p>
        </div>
        {pets.length > 0 && (
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all text-sm font-semibold shadow-lg shadow-teal-600/25">
            <Plus className="w-4 h-4" /> Add Medication
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search medications..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm" />
        </div>
        <select value={filterPet} onChange={(e) => setFilterPet(e.target.value)}
          className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm">
          <option value="all">All Pets</option>
          {pets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {pets.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <div className="text-5xl mb-3">💊</div>
          <h3 className="font-bold text-slate-800 mb-1">No pets added yet</h3>
          <p className="text-slate-400 text-sm mb-4">Add a pet first before adding medications.</p>
          <Link href="/pets/new" className="px-6 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 text-sm font-medium transition-all inline-block">Add Pet</Link>
        </div>
      )}

      {pets.length > 0 && filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <div className="text-5xl mb-3">💊</div>
          <h3 className="font-bold text-slate-800 mb-1">No medications found</h3>
          <p className="text-slate-400 text-sm mb-4">{search ? "Try a different search" : "Click 'Add Medication' to get started."}</p>
          {!search && <button onClick={openAdd} className="px-6 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 text-sm font-medium transition-all">Add Medication</button>}
        </div>
      )}

      {/* Grouped by Pet */}
      <div className="space-y-6">
        {byPet.map(({ pet, meds }) => (
          <div key={pet.id}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center text-sm">
                {pet.species === "Dog" ? "🐕" : pet.species === "Cat" ? "🐈" : "🐾"}
              </div>
              <h2 className="font-bold text-slate-800">{pet.name}</h2>
              <span className="text-sm text-slate-400">({meds.length} medication{meds.length !== 1 ? "s" : ""})</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {meds.map((med, i) => (
                <motion.div key={med.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-teal-100">
                          <Pill className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{med.name}</h3>
                          <p className="text-slate-500 text-sm">{med.instructions || "No instructions"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-xs font-bold text-slate-800 truncate">{med.dosage}</p>
                        <p className="text-xs text-slate-400">Dosage</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-xs font-bold text-slate-800">{med.frequency || "Daily"}</p>
                        <p className="text-xs text-slate-400">Frequency</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-xs font-bold text-slate-800">{Array.isArray(med.time_of_day) ? med.time_of_day[0] : med.time_of_day || "Morning"}</p>
                        <p className="text-xs text-slate-400">Time</p>
                      </div>
                    </div>
                    <button onClick={() => setExpandedId(expandedId === med.id ? null : med.id)}
                      className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium mb-2">
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedId === med.id ? "rotate-180" : ""}`} />
                      {expandedId === med.id ? "Hide details" : "Show details"}
                    </button>
                    <AnimatePresence>
                      {expandedId === med.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="space-y-2 pb-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                            {med.start_date && <p><span className="font-semibold">Start:</span> {med.start_date}{med.end_date && ` → End: ${med.end_date}`}</p>}
                            {med.instructions && <p><span className="font-semibold">Instructions:</span> {med.instructions}</p>}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <button onClick={() => openEdit(med)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all border border-slate-200">
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={() => setDeleteConfirm(med.id)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-all border border-red-100">
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="font-bold text-slate-900 mb-2">Delete Medication?</h3>
              <p className="text-slate-500 text-sm mb-6">This will permanently remove <strong>{medications.find((m) => m.id === deleteConfirm)?.name}</strong>.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-medium">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 text-sm font-medium">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="font-bold text-slate-900">{editId ? "Edit Medication" : "Add Medication"}</h2>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center">
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>
              <div className="p-6 space-y-4">
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
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Medication Name <span className="text-red-400">*</span></label>
                    <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Heartgard Plus"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Dosage <span className="text-red-400">*</span></label>
                    <input value={form.dosage} onChange={(e) => set("dosage", e.target.value)} placeholder="e.g. 1 tablet"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Frequency</label>
                    <select value={form.frequency} onChange={(e) => set("frequency", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50">
                      {FREQUENCIES.map((f) => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Time of Day</label>
                    <select value={form.time_of_day[0]} onChange={(e) => set("time_of_day", [e.target.value])}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50">
                      {TIMES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
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
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Instructions</label>
                  <textarea value={form.instructions} onChange={(e) => set("instructions", e.target.value)} placeholder="Administration instructions..."
                    rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-medium">Cancel</button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 text-sm font-medium shadow-lg shadow-teal-600/20 disabled:opacity-70">
                    {saving ? "Saving..." : editId ? "Save Changes" : "Add Medication"}
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
