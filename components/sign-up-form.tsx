"use client";

import React, { useState } from "react";
import {
  Eye, EyeOff, Mail, Lock, User, Phone,
  AlertCircle, CheckCircle2, XCircle,
} from "lucide-react";
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

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  bgColor: string;
  checks: Record<string, boolean>;
}

function evaluatePassword(password: string): PasswordStrength {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()\-_=+[\]{}|;:'",.<>?/\\]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  if (score <= 1) return { score, label: "Very Weak", color: "text-red-500", bgColor: "bg-red-500", checks };
  if (score === 2) return { score, label: "Weak", color: "text-orange-500", bgColor: "bg-orange-500", checks };
  if (score === 3) return { score, label: "Fair", color: "text-yellow-500", bgColor: "bg-yellow-500", checks };
  if (score === 4) return { score, label: "Strong", color: "text-blue-500", bgColor: "bg-blue-500", checks };
  return { score, label: "Very Strong", color: "text-green-500", bgColor: "bg-green-500", checks };
}

export function SignUpForm() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    phone: "", password: "", confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const strength = evaluatePassword(form.password);
  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.firstName.trim() || !form.lastName.trim()) return setError("Please enter your first and last name.");
    if (!form.email.trim()) return setError("Please enter your email address.");
    if (!/\S+@\S+\.\S+/.test(form.email)) return setError("Please enter a valid email address.");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (!strength.checks.uppercase) return setError("Password must contain at least 1 uppercase letter.");
    if (!strength.checks.number) return setError("Password must contain at least 1 number.");
    if (!strength.checks.special) return setError("Password must contain at least 1 special character.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    if (!agreeTerms) return setError("Please agree to the Terms & Conditions to continue.");

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            first_name: form.firstName,
            last_name: form.lastName,
            phone: form.phone,
          },
        },
      });
      if (authError) throw authError;
      router.push("/auth/sign-up-success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const CheckItem = ({ ok, label }: { ok: boolean; label: string }) => (
    <div className={`flex items-center gap-1.5 text-xs transition-colors ${ok ? "text-green-600" : "text-slate-400"}`}>
      {ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
      {label}
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div
        className="hidden lg:flex lg:w-2/5 relative overflow-hidden flex-col justify-between p-12"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #0d3d36 50%, #134e4a 100%)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 text-teal-400">
            <PawIcon />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">PawTracker</span>
        </div>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-bold text-white leading-tight mb-4" style={{ fontSize: "2.25rem", fontWeight: 800 }}>
              Your pet deserves<br />the <span className="text-teal-400">very best care.</span>
            </h2>
            <p className="text-slate-300 leading-relaxed mb-8">
              Join thousands of dedicated pet owners who trust PawTracker to keep their furry friends healthy and happy.
            </p>
            <div className="space-y-4">
              {[
                { icon: "✅", title: "Never miss a dose", desc: "Automated reminders for every medication" },
                { icon: "📋", title: "Complete health records", desc: "All your pet's health data in one place" },
                { icon: "🏥", title: "Find vets near you", desc: "Locate trusted veterinary care instantly" },
                { icon: "🔒", title: "Safe & private", desc: "Your data is always protected" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-white font-semibold text-sm">{item.title}</p>
                    <p className="text-slate-400 text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="text-slate-500 text-xs">© 2025 PawTracker. All rights reserved.</div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-6 lg:p-12 bg-white overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 text-teal-600">
              <PawIcon />
            </div>
            <span className="text-xl font-bold text-slate-900">PawTracker</span>
          </div>

          <div className="mb-6">
            <h2 className="font-bold text-slate-900 mb-1" style={{ fontSize: "1.75rem" }}>
              Create your account
            </h2>
            <p className="text-slate-500">Start tracking your pet&apos;s health today — it&apos;s free!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                    placeholder="Alex"
                    className="w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50 text-sm transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                  placeholder="Johnson"
                  className="w-full px-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50 text-sm transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="alex@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50 text-sm transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Phone Number <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50 text-sm transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Create a strong password"
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

              {form.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.bgColor : "bg-slate-200"}`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs font-semibold ${strength.color}`}>{strength.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <CheckItem ok={strength.checks.length} label="At least 8 characters" />
                    <CheckItem ok={strength.checks.uppercase} label="1 uppercase letter" />
                    <CheckItem ok={strength.checks.number} label="1 number" />
                    <CheckItem ok={strength.checks.special} label="1 special character" />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => set("confirmPassword", e.target.value)}
                  placeholder="Re-type your password"
                  className={`w-full pl-10 pr-10 py-3 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent bg-slate-50 text-sm transition-all ${
                    form.confirmPassword && form.password !== form.confirmPassword
                      ? "border-red-300 focus:ring-red-400"
                      : form.confirmPassword && form.password === form.confirmPassword
                      ? "border-green-300 focus:ring-green-400"
                      : "border-slate-200 focus:ring-teal-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {form.confirmPassword && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    {form.password === form.confirmPassword ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 accent-teal-600 cursor-pointer flex-shrink-0"
              />
              <span className="text-sm text-slate-600 leading-relaxed">
                I agree to the{" "}
                <span className="text-teal-600 font-medium">Terms &amp; Conditions</span>
                {" "}and{" "}
                <span className="text-teal-600 font-medium">Privacy Policy</span>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-70 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-teal-600/25"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                "🐾 Create My Account"
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
            >
              Sign in →
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
