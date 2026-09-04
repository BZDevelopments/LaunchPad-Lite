import type { Metadata } from "next";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { siteConfig } from "@/user-control/site-config";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = { title: "Changelog", description: `What's new in ${siteConfig.name}.` };

const entries: Array<{ date: string; title: string; description: string; tag?: string }> = [
  { date: new Date().toISOString().slice(0, 10), title: "Initial release", description: "Launched with auth, payments, and your chosen site modules.", tag: "Launch" },
];

export default function ChangelogPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNav />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><Sparkles className="h-7 w-7 text-primary" /></div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-display)" }}>Changelog</h1>
          </div>
          <div className="space-y-8 border-l border-border pl-6">
            {entries.map((entry) => (
              <div key={entry.date} className="relative">
                <div className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {new Date(entry.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                  {entry.tag && <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-primary">{entry.tag}</span>}
                </p>
                <h2 className="mb-1 font-semibold text-foreground">{entry.title}</h2>
                <p className="text-sm text-muted-foreground">{entry.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
