"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "@/components/layout/AuthLayout";
import { authApi, getErrorMessage } from "@/services/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success("Reset instructions sent (check console in dev mode)");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot password" subtitle="Enter your email to receive reset instructions">
      {sent ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40">
            <Mail className="h-7 w-7 text-emerald-600" />
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            If an account exists for <strong>{email}</strong>, you&apos;ll receive reset instructions.
            In development mode, check your browser console for the reset token.
          </p>
          <Link href="/login" className="btn-primary w-full">
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-field">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="input-field pl-10"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Sending..." : "Send reset instructions"}
          </button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Remember your password?{" "}
            <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
