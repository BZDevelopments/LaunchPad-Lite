"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Sparkle, Loader2, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { authClient } from "@/engine/auth/auth-client";
import { siteConfig } from "@/user-control/site-config";
import toast from "react-hot-toast";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const tokenError = searchParams.get("error");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordStrength = getPasswordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) { toast.error("Missing or invalid reset link."); return; }
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (password !== confirmPassword) { toast.error("Passwords don't match"); return; }

    setLoading(true);
    try {
      const { error } = await authClient.resetPassword({ newPassword: password, token });
      if (error) toast.error(error.message ?? "This reset link is invalid or has expired.");
      else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch {
      toast.error("Something went wrong. Please request a new link.");
    } finally {
      setLoading(false);
    }
  }

  const invalidLink = !token || !!tokenError;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary"><Sparkle className="h-5 w-5 text-primary-foreground" fill="currentColor" /></div>
          <span className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>{siteConfig.name}</span>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl shadow-black/5">
          {invalidLink ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10"><XCircle className="h-7 w-7 text-destructive" /></div>
              <h1 className="mb-2 text-xl font-bold text-foreground">Invalid or expired link</h1>
              <p className="mb-6 text-sm text-muted-foreground">Request a new one.</p>
              <Link href="/forgot-password" className="inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Request New Link</Link>
            </div>
          ) : success ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10"><CheckCircle2 className="h-7 w-7 text-green-500" /></div>
              <h1 className="mb-2 text-xl font-bold text-foreground">Password reset</h1>
              <p className="text-sm text-muted-foreground">Redirecting to sign in...</p>
            </div>
          ) : (
            <>
              <h1 className="mb-1 text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Set a new password</h1>
              <p className="mb-8 text-sm text-muted-foreground">Choose a strong password.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">New password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" placeholder="Min. 8 characters" className="w-full rounded-xl border border-border bg-card px-4 py-3 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1">{[1, 2, 3, 4].map((i) => <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= passwordStrength.score ? passwordStrength.color : "bg-muted"}`} />)}</div>
                      <p className="mt-1 text-xs text-muted-foreground">{passwordStrength.label}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Confirm new password</label>
                  <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" placeholder="Re-enter password" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-opacity hover:opacity-90 disabled:opacity-60">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />} Reset Password
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;
  const levels = [
    { label: "Too weak", color: "bg-destructive" },
    { label: "Weak", color: "bg-orange-400" },
    { label: "Fair", color: "bg-yellow-400" },
    { label: "Strong", color: "bg-green-400" },
    { label: "Very strong", color: "bg-green-500" },
  ];
  return { score, ...(levels[score] ?? levels[0]) };
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
