"use client";

import React, { useState } from "react";
import { Bell, Globe, Shield, AlertTriangle, Sun, Moon, ArrowLeft, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion } from "motion/react";

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button onClick={onChange}
    className={`w-12 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 ${checked ? "bg-teal-500 shadow-lg shadow-teal-500/40" : "bg-slate-200"}`}>
    <span
      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300"
      style={{ left: checked ? "1.5rem" : "0.125rem" }}
    />
  </button>
);

export default function SettingsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState({
    doseReminders: true, missedDoses: true, vetAppointments: false, weeklyReport: true,
  });
  const [isDark, setIsDark] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const toggleNotif = (key: keyof typeof notifications) =>
    setNotifications((n) => ({ ...n, [key]: !n[key] }));

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const handleDeleteAccount = async () => {
    showToast("Account deletion must be done from your Supabase dashboard.");
    setDeleteConfirm(false);
  };

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto">
      {toast && <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium">{toast}</div>}

      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all shadow-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your preferences</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              {isDark ? <Moon className="w-4 h-4 text-teal-300" /> : <Sun className="w-4 h-4 text-amber-300" />}
            </div>
            <h2 className="font-bold text-slate-900">Appearance</h2>
          </div>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-slate-800" : "bg-amber-100"}`}>
                {isDark ? <Moon className="w-5 h-5 text-teal-300" /> : <Sun className="w-5 h-5 text-amber-500" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Dark Mode</p>
                <p className="text-xs text-slate-400">{isDark ? "Dark theme active" : "Light theme active"}</p>
              </div>
            </div>
            <Toggle checked={isDark} onChange={() => setIsDark(!isDark)} />
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center">
              <Bell className="w-4 h-4 text-teal-600" />
            </div>
            <h2 className="font-bold text-slate-900">Notifications</h2>
          </div>
          <div className="space-y-4">
            {[
              { key: "doseReminders", label: "Dose Reminders", desc: "Get notified when a dose is due", emoji: "💊" },
              { key: "missedDoses", label: "Missed Dose Alerts", desc: "Alert when a dose is missed", emoji: "⚠️" },
              { key: "vetAppointments", label: "Vet Appointments", desc: "Upcoming appointment reminders", emoji: "🏥" },
              { key: "weeklyReport", label: "Weekly Health Report", desc: "Summary of your pets' health", emoji: "📊" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                </div>
                <Toggle checked={notifications[item.key as keyof typeof notifications]} onChange={() => toggleNotif(item.key as keyof typeof notifications)} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* App Preferences */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
              <Globe className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-bold text-slate-900">App Preferences</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all">
              <div>
                <p className="text-sm font-semibold text-slate-800">Weight Unit</p>
                <p className="text-xs text-slate-400">Choose your preferred weight unit</p>
              </div>
              <select className="text-sm border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option>lbs (Pounds)</option>
                <option>kg (Kilograms)</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Privacy & Security */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
              <Shield className="w-4 h-4 text-green-600" />
            </div>
            <h2 className="font-bold text-slate-900">Account</h2>
          </div>
          <button onClick={handleSignOut}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-all text-left border border-slate-100 hover:border-red-200 group">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-700">Sign Out</p>
              <p className="text-xs text-slate-400">Sign out of your account</p>
            </div>
          </button>
        </motion.div>

        {/* Danger Zone */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <h2 className="font-bold text-red-700">Danger Zone</h2>
          </div>
          <div className="p-4 bg-red-50 rounded-xl border border-red-100">
            <p className="text-sm font-semibold text-red-800 mb-1">Delete Account</p>
            <p className="text-xs text-red-600 mb-3">This will permanently delete your account and all data.</p>
            {!deleteConfirm ? (
              <button onClick={() => setDeleteConfirm(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all text-sm font-semibold">
                Delete Account
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setDeleteConfirm(false)} className="flex-1 py-2 border border-slate-200 bg-white text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button onClick={handleDeleteAccount} className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700">Yes, Delete</button>
              </div>
            )}
          </div>
        </motion.div>

        <div className="text-center py-3">
          <p className="text-xs text-slate-400">PawTracker v1.0.0 · Made with ❤️ for pet lovers</p>
        </div>
      </div>
    </div>
  );
}
