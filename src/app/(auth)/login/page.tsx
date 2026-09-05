"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkle, Github, Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import { authClient } from "@/engine/auth/auth-client";
import { siteConfig } from "@/user-control/site-config";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await authClient.signIn.email(
        { email, password, callbackURL: "/dashboard" },
        {
          onSuccess: () => router.push("/dashboard"),
          onError: (ctx) => {
            if (ctx.error.status === 403) {
              toast.error("Please verify your email before signing in. Check your inbox for the link.");
            } else if (ctx.error.status === 401 || ctx.error.status === 400) {
              toast.error(ctx.error.message || "Incorrect email or password. Please try again.");
            } else {
              toast.error(ctx.error.message || "Something went wrong. Please try again.");
            }
          },
        }
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await authClient.signIn.magicLink(
        { email, callbackURL: "/dashboard" },
        { onSuccess: () => setMagicSent(true), onError: (ctx) => { toast.error(ctx.error.message); } }
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSocialLogin(provider: "google" | "github") {
    await authClient.signIn.social({ provider, callbackURL: "/dashboard" });
  }

  if (magicSent) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Check your email</h1>
          <p className="text-sm text-muted-foreground">We sent a magic link to <strong className="text-foreground">{email}</strong>. Click it to sign in.</p>
          <button onClick={() => { setMagicSent(false); setEmail(""); }} className="mt-6 text-sm text-primary hover:underline">Use a different email</button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1 className="mb-1 text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Welcome back</h1>
      <p className="mb-8 text-sm text-muted-foreground">Sign in to your {siteConfig.name} account</p>

      <div className="mb-6 grid gap-3">
        {siteConfig.auth.providers.google && (
          <button onClick={() => handleSocialLogin("google")} className="flex items-center justify-center gap-3 rounded-xl border border-border bg-card py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            <GoogleIcon /> Continue with Google
          </button>
        )}
        {siteConfig.auth.providers.github && (
          <button onClick={() => handleSocialLogin("github")} className="flex items-center justify-center gap-3 rounded-xl border border-border bg-card py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            <Github className="h-4 w-4" /> Continue with GitHub
          </button>
        )}
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center"><span className="bg-background px-3 text-xs text-muted-foreground">or continue with email</span></div>
      </div>

      {siteConfig.auth.providers.magicLink && siteConfig.auth.providers.emailPassword && (
        <div className="mb-6 flex rounded-xl border border-border bg-muted p-1">
          <button onClick={() => setMode("password")} className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${mode === "password" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>Password</button>
          <button onClick={() => setMode("magic")} className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${mode === "magic" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>Magic Link</button>
        </div>
      )}

      <form onSubmit={mode === "magic" ? handleMagicLink : handleEmailLogin} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Email address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>

        {mode === "password" && (
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Password</label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" placeholder="••••••••" className="w-full rounded-xl border border-border bg-card px-4 py-3 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}

        <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-opacity hover:opacity-90 disabled:opacity-60">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "magic" ? "Send Magic Link" : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account? <Link href="/register" className="font-medium text-primary hover:underline">Sign up free</Link>
      </p>
    </AuthLayout>
  );
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary"><Sparkle className="h-5 w-5 text-primary-foreground" fill="currentColor" /></div>
          <span className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>{siteConfig.name}</span>
        </Link>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl shadow-black/5">{children}</div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
