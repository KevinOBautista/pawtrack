"use client";

import { createClient } from "@/lib/supabase/client";
import { Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const PawIcon = () => (
  <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
    <ellipse cx="20" cy="30" rx="10" ry="13" />
    <ellipse cx="40" cy="18" rx="10" ry="13" />
    <ellipse cx="60" cy="18" rx="10" ry="13" />
    <ellipse cx="80" cy="30" rx="10" ry="13" />
    <path d="M15 55 Q20 40 35 40 L50 55 L65 40 Q80 40 85 55 Q95 75 50 88 Q5 75 15 55Z" />
  </svg>
);

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 text-teal-600"><PawIcon /></div>
          <span className="text-xl font-bold text-slate-900">PawTracker</span>
        </div>

        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h2>
            <p className="text-slate-500 mb-6">
              If an account exists for <strong>{email}</strong>, we sent a password reset link.
            </p>
            <Link
              href="/auth/login"
              className="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
            >
              ← Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Forgot password?</h2>
              <p className="text-slate-500">Enter your email and we&apos;ll send you a reset link.</p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50 text-sm transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-70 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-teal-600/25"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send reset link"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Remember your password?{" "}
              <Link href="/auth/login" className="text-teal-600 hover:text-teal-700 font-semibold transition-colors">
                Sign in →
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
