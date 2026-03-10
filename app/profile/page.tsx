"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Shield, Edit2, Save, X, CheckCircle2, Eye, EyeOff, PawPrint, Pill, ClipboardList, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion } from "motion/react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ pets: 0, medications: 0, doseLogs: 0, sitters: 0 });
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone_number: "" });
  const [pwForm, setPwForm] = useState({ newPw: "", confirm: "" });
  const [showPw, setShowPw] = useState({ newPw: false, confirm: false });
  const [changingPw, setChangingPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setForm({ full_name: user?.user_metadata?.full_name || "", phone_number: user?.user_metadata?.phone || "" });

    const [{ count: pets }, { count: meds }, { count: logs }, { count: sitters }] = await Promise.all([
      supabase.from("pets").select("*", { count: "exact", head: true }),
      supabase.from("medications").select("*", { count: "exact", head: true }),
      supabase.from("dose_logs").select("*", { count: "exact", head: true }),
      supabase.from("sitters").select("*", { count: "exact", head: true }),
    ]);
    setStats({ pets: pets || 0, medications: meds || 0, doseLogs: logs || 0, sitters: sitters || 0 });
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    await supabase.auth.updateUser({ data: { full_name: form.full_name, phone: form.phone_number } });
    showToast("Profile updated successfully! ✅");
    setSaving(false);
    setEditMode(false);
    loadData();
  };

  const handlePasswordChange = async () => {
    if (pwForm.newPw.length < 8) return showToast("Password must be at least 8 characters");
    if (!/[A-Z]/.test(pwForm.newPw)) return showToast("Password needs at least 1 uppercase letter");
    if (!/[0-9]/.test(pwForm.newPw)) return showToast("Password needs at least 1 number");
    if (pwForm.newPw !== pwForm.confirm) return showToast("Passwords do not match");

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pwForm.newPw });
    if (error) { showToast(error.message); }
    else {
      showToast("Password changed successfully! 🔒");
      setPwForm({ newPw: "", confirm: "" });
      setChangingPw(false);
    }
    setSaving(false);
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();
  const statItems = [
    { icon: PawPrint, label: "Pets", value: stats.pets, color: "text-teal-600", bg: "bg-teal-50" },
    { icon: Pill, label: "Medications", value: stats.medications, color: "text-violet-600", bg: "bg-violet-50" },
    { icon: ClipboardList, label: "Dose Logs", value: stats.doseLogs, color: "text-blue-600", bg: "bg-blue-50" },
    { icon: User, label: "Sitters", value: stats.sitters, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      {toast && <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium">{toast}</div>}

      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all shadow-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your account information</p>
        </div>
      </div>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold border-2 border-white/30">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold">{displayName}</h2>
            <p className="text-teal-200 text-sm">{user?.email}</p>
            <span className="inline-flex items-center gap-1 mt-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
              <Shield className="w-3 h-3" /> Pet Owner
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-3 mb-6">
        {statItems.map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-3 text-center`}>
            <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-1`} />
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Profile Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-slate-900">Personal Information</h2>
          {!editMode ? (
            <button onClick={() => setEditMode(true)} className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium border border-teal-200 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-all">
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditMode(false)} className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all">
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 text-sm text-white bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-lg transition-all disabled:opacity-70">
                <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>

        {editMode ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Display Name</label>
              <input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
              <input value={user?.email || ""} disabled
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-100 text-slate-400 cursor-not-allowed" />
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed here</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {[
              { icon: User, label: "Display Name", value: displayName },
              { icon: Mail, label: "Email", value: user?.email },
              { icon: Shield, label: "Account Type", value: "Pet Owner" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="text-sm font-medium text-slate-800">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Change Password */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900">Security</h2>
          {!changingPw && (
            <button onClick={() => setChangingPw(true)} className="text-sm text-teal-600 hover:text-teal-700 font-medium border border-teal-200 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-all">
              Change Password
            </button>
          )}
        </div>
        {!changingPw ? (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
              <Shield className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Password protected</p>
              <p className="text-xs text-slate-400">Your account is secured with a password</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
          </div>
        ) : (
          <div className="space-y-4">
            {(["newPw", "confirm"] as const).map((field) => (
              <div key={field}>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {field === "newPw" ? "New Password" : "Confirm New Password"}
                </label>
                <div className="relative">
                  <input type={showPw[field] ? "text" : "password"} value={pwForm[field]}
                    onChange={(e) => setPwForm((f) => ({ ...f, [field]: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full pr-10 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50" />
                  <button type="button" onClick={() => setShowPw((s) => ({ ...s, [field]: !s[field] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPw[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
            <div className="flex gap-3">
              <button onClick={() => { setChangingPw(false); setPwForm({ newPw: "", confirm: "" }); }}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all">Cancel</button>
              <button onClick={handlePasswordChange} disabled={saving}
                className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-all disabled:opacity-70">
                {saving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
