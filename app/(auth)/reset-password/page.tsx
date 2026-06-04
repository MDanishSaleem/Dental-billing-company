"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle2, Lock } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ?? "Failed to reset password. The link may have expired."
        );
      }

      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h1 className="font-bold text-xl text-[#0F1F3D] mb-2">Invalid Link</h1>
        <p className="text-slate-500 text-sm mb-5">
          This password reset link is invalid or has expired.
        </p>
        <Link
          href="/auth/forgot-password"
          className="text-sm font-semibold text-teal-600 hover:text-teal-700"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7 text-emerald-500" />
        </div>
        <h1 className="font-bold text-xl text-[#0F1F3D] mb-2">
          Password reset!
        </h1>
        <p className="text-slate-500 text-sm mb-1">
          Your password has been changed successfully.
        </p>
        <p className="text-slate-400 text-xs">Redirecting you to sign in…</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-7">
        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mb-3">
          <Lock className="w-5 h-5 text-teal-600" />
        </div>
        <h1 className="font-bold text-2xl text-[#0F1F3D] mb-1">
          Create new password
        </h1>
        <p className="text-slate-500 text-sm">
          Enter your new password below.
        </p>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* New Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            New Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              className="w-full h-11 px-4 pr-11 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirm"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirm"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Repeat your new password"
              autoComplete="new-password"
              className="w-full h-11 px-4 pr-11 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !password || !confirmPassword}
          className="w-full h-11 rounded-xl bg-[#0F1F3D] text-white text-sm font-semibold hover:bg-[#0F1F3D]/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Resetting…
            </>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/auth/login"
          className="text-sm text-slate-400 hover:text-slate-700 transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#0F1F3D]" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
