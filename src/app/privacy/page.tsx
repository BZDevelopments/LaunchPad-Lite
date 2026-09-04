import type { Metadata } from "next";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { siteConfig } from "@/user-control/site-config";

export const metadata: Metadata = { title: "Privacy Policy", description: `Privacy policy for ${siteConfig.name}.` };

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNav />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-display)" }}>Privacy Policy</h1>
          <p className="mb-8 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
            <strong className="text-foreground">Template notice:</strong> This is a starting structure, not legal advice. Have a lawyer review this before launching to real users.
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
              <p className="text-sm text-muted-foreground">We collect information you provide directly (name, email), usage data, and information from third parties when you sign in via Google or GitHub.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-foreground">2. How We Use Information</h2>
              <p className="text-sm text-muted-foreground">To provide and improve the service, process payments, send transactional emails, and comply with legal obligations.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-foreground">3. Third-Party Services</h2>
              <p className="text-sm text-muted-foreground">We use payment processors, email providers, and cloud storage. Each processes data under its own privacy policy.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-foreground">4. Your Rights</h2>
              <p className="text-sm text-muted-foreground">You may request access, correction, export, or deletion of your data. Contact {siteConfig.email.support}.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-foreground">5. Contact</h2>
              <p className="text-sm text-muted-foreground">Questions: <a href={`mailto:${siteConfig.email.support}`} className="text-primary hover:underline">{siteConfig.email.support}</a></p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
