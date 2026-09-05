import { auth } from "@/engine/auth/auth";
import { headers } from "next/headers";
import { siteConfig } from "@/user-control/site-config";
import { Settings } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          Good to see you, {session.user.name?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">Here's your {siteConfig.name} workspace.</p>
      </div>

      <div className="mb-8">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-2 font-semibold text-foreground">Welcome to LaunchPad Lite</h2>
          <p className="text-sm text-muted-foreground mb-4">
            This is the foundational dashboard. In the Pro version, this adapts to show SaaS billing, AI usage, E-commerce orders, or Agency leads based on your site configuration.
          </p>
          <a href="https://launchpad-checkout.netlify.app/" className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Upgrade to Pro
          </a>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-semibold text-foreground">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <a href="/dashboard/settings" className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            <Settings className="h-4 w-4 text-primary" /> Settings
          </a>
        </div>
      </div>
    </div>
  );
}
