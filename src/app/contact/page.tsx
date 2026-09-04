"use client";

import { useState } from "react";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { Loader2, CheckCircle2, Mail } from "lucide-react";
import { siteConfig } from "@/user-control/site-config";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company: company || undefined, message, source: "contact-page" }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed to send message"); return; }
      setSent(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNav />
      <main className="flex-1 px-6 py-20">
        <div className="mx-auto max-w-xl">
          <div className="mb-10 text-center">
            <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-display)" }}>Get in touch</h1>
            <p className="text-muted-foreground">We'll get back to you as soon as we can.</p>
          </div>

          {sent ? (
            <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-8 text-center">
              <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-600" />
              <h2 className="mb-1 font-semibold text-foreground">Message sent</h2>
              <p className="text-sm text-muted-foreground">Thanks for reaching out — we'll reply soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-8 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Company <span className="text-muted-foreground">(optional)</span></label>
                <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Message</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:opacity-90 disabled:opacity-60">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />} Send Message
              </button>
            </form>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
