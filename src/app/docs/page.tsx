import type { Metadata } from "next";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { siteConfig } from "@/user-control/site-config";
import { BookOpen, Rocket, KeyRound, CreditCard, Database, Brain } from "lucide-react";

export const metadata: Metadata = { title: "Documentation", description: `Get started with ${siteConfig.name}.` };

const sections = [
  {
    icon: Rocket, title: "Getting Started",
    items: [
      { q: "How do I set up my environment?", a: "Copy .env.example to .env.local and fill in DATABASE_URL, BETTER_AUTH_SECRET, and NEXT_PUBLIC_APP_URL at minimum." },
      { q: "How do I change what kind of site this is?", a: "Edit siteConfig.siteType in src/user-control/site-config.ts — saas, portfolio, agency, ecommerce, content, or marketing." },
      { q: "How do I customize branding?", a: "Edit src/user-control/site-config.ts — name, tagline, colors live in theme-config.ts." },
    ],
  },
  {
    icon: KeyRound, title: "Authentication",
    items: [
      { q: "What auth providers are supported?", a: "Email/password, Google OAuth, GitHub OAuth, and Magic Link — toggleable in site-config.ts." },
      { q: "Do I need auth for a portfolio site?", a: "No — set features.requireAuthForDashboard to false and the public pages work without any login." },
    ],
  },
  {
    icon: CreditCard, title: "Payments",
    items: [
      { q: "Stripe or LemonSqueezy?", a: "Both supported for subscriptions. Set PAYMENT_PROVIDER in .env." },
      { q: "What about one-time purchases?", a: "The shop module uses Stripe one-time checkout, independent from subscription billing." },
    ],
  },
  {
    icon: Brain, title: "AI Features",
    items: [
      { q: "Are AI features required?", a: "No — set features.modules.ai to false and the AI dashboard pages disappear entirely." },
      { q: "How does the Knowledge Base work?", a: "Upload text, it's chunked and embedded via pgvector, then searchable through chat." },
    ],
  },
  {
    icon: Database, title: "Database",
    items: [
      { q: "What database do I need?", a: "PostgreSQL. Neon, Supabase, Railway all work." },
      { q: "How do I run migrations?", a: "npm run db:push for development." },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNav />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><BookOpen className="h-7 w-7 text-primary" /></div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-display)" }}>Documentation</h1>
          </div>
          <div className="space-y-10">
            {sections.map((section) => (
              <div key={section.title}>
                <div className="mb-4 flex items-center gap-2"><section.icon className="h-5 w-5 text-primary" /><h2 className="text-lg font-bold text-foreground">{section.title}</h2></div>
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div key={item.q} className="rounded-xl border border-border bg-card p-5">
                      <p className="mb-1.5 font-medium text-foreground">{item.q}</p>
                      <p className="text-sm text-muted-foreground">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
            <p className="text-sm text-muted-foreground">Full architecture reference: <code className="rounded bg-muted px-1.5 py-0.5 text-xs">AGENTS.md</code> in your project root.</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
