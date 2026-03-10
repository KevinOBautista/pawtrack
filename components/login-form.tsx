"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion } from "motion/react";

const PawIcon = () => (
  <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
    <ellipse cx="20" cy="30" rx="10" ry="13" />
    <ellipse cx="40" cy="18" rx="10" ry="13" />
    <ellipse cx="60" cy="18" rx="10" ry="13" />
    <ellipse cx="80" cy="30" rx="10" ry="13" />
    <path d="M15 55 Q20 40 35 40 L50 55 L65 40 Q80 40 85 55 Q95 75 50 88 Q5 75 15 55Z" />
  </svg>
);

const FloatingPaw = ({ style }: { style: React.CSSProperties }) => (
  <div className="absolute opacity-10 text-teal-300" style={style}>
    <PawIcon />
  </div>
);

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div
        className="hidden lg:flex lg:w-3/5 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #0d3d36 50%, #134e4a 100%)" }}
      >
        <FloatingPaw style={{ width: 80, top: "5%", left: "10%", transform: "rotate(-15deg)" }} />
        <FloatingPaw style={{ width: 50, top: "15%", left: "70%", transform: "rotate(20deg)" }} />
        <FloatingPaw style={{ width: 120, top: "60%", left: "5%", transform: "rotate(10deg)" }} />
        <FloatingPaw style={{ width: 60, top: "75%", left: "60%", transform: "rotate(-25deg)" }} />
        <FloatingPaw style={{ width: 90, top: "40%", left: "80%", transform: "rotate(5deg)" }} />
        <FloatingPaw style={{ width: 40, top: "85%", left: "30%", transform: "rotate(-10deg)" }} />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 text-teal-400">
              <PawIcon />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">PawTracker</span>
          </div>

          <div className="max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-500/30 rounded-full px-4 py-1.5 mb-6">
                <span className="text-teal-300 text-sm font-medium">🐾 Trusted by 50,000+ pet owners</span>
              </div>
              <h1
                className="font-bold text-white leading-tight mb-4"
                style={{ fontSize: "3rem", fontWeight: 800 }}
              >
                Every Paw.<br />
                Every Dose.<br />
                <span className="text-teal-400">Every Day.</span>
              </h1>
              <p className="text-slate-300 text-lg leading-relaxed mb-8">
                Your pet&apos;s complete health companion — track medications, monitor wellness,
                and find the best care near you.
              </p>

              <div className="flex flex-wrap gap-3">
                {[
                  { icon: "💊", text: "Medication Tracking" },
                  { icon: "📊", text: "Health Dashboard" },
                  { icon: "🗺️", text: "Vet Finder" },
                  { icon: "👥", text: "Sitter Management" },
                ].map((f) => (
                  <div
                    key={f.text}
                    className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-lg px-3 py-2 border border-white/10"
                  >
                    <span>{f.icon}</span>
                    <span className="text-white text-sm font-medium">{f.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1660704978836-1c203a1f5fac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
              alt="Happy pets"
              className="w-full max-w-md rounded-2xl object-cover h-48 shadow-2xl opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent rounded-2xl max-w-md" />
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-white text-sm font-medium">Updated in real-time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-6 lg:p-12 bg-white">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 text-teal-600">
              <PawIcon />
            </div>
            <span className="text-xl font-bold text-slate-900">PawTracker</span>
          </div>

          <div className="mb-8">
            <h2 className="font-bold text-slate-900 mb-2" style={{ fontSize: "1.75rem" }}>
              Welcome back!
            </h2>
            <p className="text-slate-500">Sign in to manage your pets&apos; health.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50 text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 accent-teal-600 cursor-pointer"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-70 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-teal-600/25"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/sign-up"
              className="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
            >
              Create one for free →
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
