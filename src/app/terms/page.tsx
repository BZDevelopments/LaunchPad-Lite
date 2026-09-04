import type { Metadata } from "next";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { siteConfig } from "@/user-control/site-config";

export const metadata: Metadata = { title: "Terms of Service", description: `Terms of service for ${siteConfig.name}.` };

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNav />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-display)" }}>Terms of Service</h1>
          <p className="mb-8 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
            <strong className="text-foreground">Template notice:</strong> This is a starting structure, not legal advice. Have a lawyer review this before launching.
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
            <section><h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2><p className="text-sm text-muted-foreground">By using {siteConfig.name}, you agree to these terms.</p></section>
            <section><h2 className="text-lg font-semibold text-foreground">2. Accounts</h2><p className="text-sm text-muted-foreground">You're responsible for your account's security and activity.</p></section>
            <section><h2 className="text-lg font-semibold text-foreground">3. Billing</h2><p className="text-sm text-muted-foreground">Paid plans/purchases are billed as described at checkout. Define your refund policy here.</p></section>
            <section><h2 className="text-lg font-semibold text-foreground">4. Acceptable Use</h2><p className="text-sm text-muted-foreground">Don't misuse the service, attempt to bypass limits, or use it for illegal purposes.</p></section>
            <section><h2 className="text-lg font-semibold text-foreground">5. Limitation of Liability</h2><p className="text-sm text-muted-foreground">The service is provided "as is" without warranties, to the extent permitted by law.</p></section>
            <section><h2 className="text-lg font-semibold text-foreground">6. Contact</h2><p className="text-sm text-muted-foreground">Questions: <a href={`mailto:${siteConfig.email.support}`} className="text-primary hover:underline">{siteConfig.email.support}</a></p></section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
