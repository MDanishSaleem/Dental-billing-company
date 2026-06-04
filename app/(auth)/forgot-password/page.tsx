"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Something went wrong.");
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7 text-emerald-500" />
        </div>
        <h1 className="font-bold text-xl text-[#0F1F3D] mb-2">Check your email</h1>
        <p className="text-slate-500 text-sm mb-6">
          If an account exists for{" "}
          <span className="font-semibold text-slate-700">{email}</span>, we&apos;ve
          sent a password reset link. It will expire in 1 hour.
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-7">
        <h1 className="font-bold text-2xl text-[#0F1F3D] mb-1">
          Reset your password
        </h1>
        <p className="text-slate-500 text-sm">
          Enter your email address and we&apos;ll send you a reset link.
        </p>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="w-full h-11 rounded-xl bg-[#0F1F3D] text-white text-sm font-semibold hover:bg-[#0F1F3D]/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending…
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
