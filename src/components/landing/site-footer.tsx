import Link from "next/link";
import { Sparkle } from "lucide-react";
import { siteConfig } from "@/user-control/site-config";

const currentYear = new Date().getFullYear();

const footerLinks = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Get Pro", href: "https://launchpad-checkout.netlify.app/" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <Link href="/" className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <Sparkle className="h-3.5 w-3.5 text-primary-foreground" fill="currentColor" />
              </div>
              {siteConfig.name}
            </Link>
            <p className="text-sm text-muted-foreground">{siteConfig.tagline}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              By{" "}
              <a href="https://github.com/BZDevelopments" className="hover:text-foreground underline underline-offset-2">
                BZDevelopments
              </a>
            </p>
          </div>

          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <p className="mb-3 text-sm font-semibold text-foreground">{group}</p>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">© {currentYear} BZDevelopments. MIT License.</p>
          <div className="flex items-center gap-4">
            <a href={siteConfig.social.github} className="text-sm text-muted-foreground hover:text-foreground transition-colors">GitHub</a>
            <a href="https://launchpad-checkout.netlify.app/" className="text-sm font-medium text-primary hover:underline">Get Pro →</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
