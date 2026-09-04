"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Sparkle, CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { authClient } from "@/engine/auth/auth-client";
import { siteConfig } from "@/user-control/site-config";
import toast from "react-hot-toast";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const errorParam = searchParams.get("error");

  const [status, setStatus] = useState<"verifying" | "success" | "error" | "no-token">(token ? "verifying" : "no-token");
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (errorParam) { setStatus("error"); return; }
    if (!token) { setStatus("no-token"); return; }
    setStatus("success");
    const t = setTimeout(() => router.push("/dashboard"), 2500);
    return () => clearTimeout(t);
  }, [token, errorParam, router]);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    setResending(true);
    try {
      await authClient.sendVerificationEmail({ email: resendEmail, callbackURL: "/verify-email" });
      setResent(true);
      toast.success("Verification email sent");
    } catch {
      toast.error("Failed to send verification email");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary"><Sparkle className="h-5 w-5 text-primary-foreground" fill="currentColor" /></div>
          <span className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>{siteConfig.name}</span>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-xl shadow-black/5">
          {status === "verifying" && (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              <h1 className="mb-2 text-xl font-bold text-foreground">Verifying your email...</h1>
            </>
          )}
          {status === "success" && (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10"><CheckCircle2 className="h-7 w-7 text-green-500" /></div>
              <h1 className="mb-2 text-xl font-bold text-foreground">Email verified!</h1>
              <p className="mb-6 text-sm text-muted-foreground">Redirecting to your dashboard...</p>
              <Link href="/dashboard" className="inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Go to Dashboard</Link>
            </>
          )}
          {status === "error" && (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10"><XCircle className="h-7 w-7 text-destructive" /></div>
              <h1 className="mb-2 text-xl font-bold text-foreground">Verification failed</h1>
              <p className="mb-6 text-sm text-muted-foreground">This link may have expired. Request a new one below.</p>
              <ResendForm email={resendEmail} setEmail={setResendEmail} onSubmit={handleResend} loading={resending} sent={resent} />
            </>
          )}
          {status === "no-token" && (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><Mail className="h-7 w-7 text-primary" /></div>
              <h1 className="mb-2 text-xl font-bold text-foreground">Check your email</h1>
              <p className="mb-6 text-sm text-muted-foreground">We sent a verification link. Didn't get it?</p>
              <ResendForm email={resendEmail} setEmail={setResendEmail} onSubmit={handleResend} loading={resending} sent={resent} />
            </>
          )}
          <p className="mt-6 text-center text-sm text-muted-foreground"><Link href="/login" className="font-medium text-primary hover:underline">Back to sign in</Link></p>
        </div>
      </div>
    </div>
  );
}

function ResendForm({ email, setEmail, onSubmit, loading, sent }: { email: string; setEmail: (v: string) => void; onSubmit: (e: React.FormEvent) => void; loading: boolean; sent: boolean }) {
  if (sent) return <p className="rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-600">Verification email sent. Check your inbox.</p>;
  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
      <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />} Resend
      </button>
    </form>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
