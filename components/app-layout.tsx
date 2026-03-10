"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, PawPrint, Pill, ClipboardList,
  MapPin, Users, User, Settings, LogOut, Menu, X, Bell, ChevronDown,
  AlertTriangle, Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "motion/react";

const PawIcon = () => (
  <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
    <ellipse cx="20" cy="30" rx="10" ry="13" />
    <ellipse cx="40" cy="18" rx="10" ry="13" />
    <ellipse cx="60" cy="18" rx="10" ry="13" />
    <ellipse cx="80" cy="30" rx="10" ry="13" />
    <path d="M15 55 Q20 40 35 40 L50 55 L65 40 Q80 40 85 55 Q95 75 50 88 Q5 75 15 55Z" />
  </svg>
);

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/pets", label: "My Pets", icon: PawPrint },
  { href: "/medications", label: "Medications", icon: Pill },
  { href: "/dose-logs", label: "Dose Logs", icon: ClipboardList },
  { href: "/vet-finder", label: "Vet Finder", icon: MapPin },
  { href: "/sitters", label: "Sitters", icon: Users },
];

export default function AppLayout({ children, userEmail }: { children: React.ReactNode; userEmail?: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const firstName = userEmail ? userEmail.split("@")[0].split(".")[0] : "User";
  const initials = firstName.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-8 h-8 text-teal-400 flex-shrink-0"><PawIcon /></div>
        <div>
          <span className="text-lg font-bold text-white leading-none tracking-tight">PawTracker</span>
          <p className="text-slate-500 text-xs leading-none mt-0.5">Pet Health Manager</p>
        </div>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="ml-auto w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        <p className="text-slate-600 text-xs font-bold uppercase tracking-widest px-3 mb-3">Main Menu</p>
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => mobile && setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(item.href, item.exact)
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-900/50"
                  : "text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <item.icon size={17} className="flex-shrink-0" />
              {item.label}
            </Link>
          ))}
        </div>

        <p className="text-slate-600 text-xs font-bold uppercase tracking-widest px-3 mt-6 mb-3">Account</p>
        <div className="space-y-1">
          <Link href="/profile" onClick={() => mobile && setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive("/profile") ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white hover:bg-white/10"}`}>
            <User size={17} className="flex-shrink-0" /> My Profile
          </Link>
          <Link href="/settings" onClick={() => mobile && setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive("/settings") ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white hover:bg-white/10"}`}>
            <Settings size={17} className="flex-shrink-0" /> Settings
          </Link>
        </div>
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-white text-sm font-medium truncate">{firstName}</p>
            <p className="text-slate-500 text-xs truncate">{userEmail}</p>
          </div>
          <LogOut size={14} className="text-slate-500 group-hover:text-red-400 transition-colors flex-shrink-0" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-900 flex-col flex-shrink-0 border-r border-white/5">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-slate-900 z-50 lg:hidden shadow-2xl"
            >
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3 flex items-center gap-3 flex-shrink-0 shadow-sm z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-9 h-9 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(o => !o); setUserMenuOpen(false); }}
              className={`relative p-2 rounded-xl transition-all ${notifOpen ? "bg-teal-50 text-teal-600" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}
            >
              <Bell className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="font-bold text-slate-900 text-sm">Notifications</p>
                  </div>
                  <div className="px-4 py-8 text-center">
                    <div className="text-3xl mb-2">🎉</div>
                    <p className="text-sm font-semibold text-slate-700">All caught up!</p>
                    <p className="text-xs text-slate-400 mt-1">No pending notifications</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
              <span className="hidden sm:block text-sm font-semibold text-slate-700">{firstName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-teal-50 to-white">
                    <p className="font-bold text-slate-900 text-sm">{firstName}</p>
                    <p className="text-slate-400 text-xs truncate">{userEmail}</p>
                  </div>
                  <Link href="/profile" onClick={() => setUserMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <User className="w-4 h-4 text-slate-400" /> My Profile
                  </Link>
                  <Link href="/settings" onClick={() => setUserMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <Settings className="w-4 h-4 text-slate-400" /> Settings
                  </Link>
                  <div className="border-t border-slate-100">
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Page Content */}
        <main
          className="flex-1 overflow-y-auto bg-slate-50"
          onClick={() => { setUserMenuOpen(false); setNotifOpen(false); }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
