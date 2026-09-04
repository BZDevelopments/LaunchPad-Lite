"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkle, Loader2, Mail, ArrowLeft } from "lucide-react";
import { authClient } from "@/engine/auth/auth-client";
import { siteConfig } from "@/user-control/site-config";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { error } = await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
      if (error) toast.error(error.message ?? "Something went wrong. Please try again.");
      else setSent(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary"><Sparkle className="h-5 w-5 text-primary-foreground" fill="currentColor" /></div>
          <span className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>{siteConfig.name}</span>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl shadow-black/5">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><Mail className="h-6 w-6 text-primary" /></div>
              <h1 className="mb-2 text-xl font-bold text-foreground">Check your email</h1>
              <p className="text-sm text-muted-foreground">If an account exists for <strong className="text-foreground">{email}</strong>, we've sent a reset link. It expires in 1 hour.</p>
              <button onClick={() => { setSent(false); setEmail(""); }} className="mt-6 text-sm text-primary hover:underline">Try a different email</button>
            </div>
          ) : (
            <>
              <h1 className="mb-1 text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Forgot your password?</h1>
              <p className="mb-8 text-sm text-muted-foreground">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Email address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-opacity hover:opacity-90 disabled:opacity-60">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />} Send Reset Link
                </button>
              </form>
            </>
          )}
          <Link href="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
