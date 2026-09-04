import Link from "next/link";
import { Sparkle } from "lucide-react";
import { siteConfig } from "@/user-control/site-config";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks: Record<string, Array<{ label: string; href: string }>> = {
    Site: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      ...(siteConfig.features.blog ? [{ label: "Blog", href: "/blog" }] : []),
      ...(siteConfig.features.changelog ? [{ label: "Changelog", href: "/changelog" }] : []),
    ],
    Legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  };

  return (
    <footer className="border-t border-border bg-muted/30 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Link href="/" className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <Sparkle className="h-3.5 w-3.5 text-primary-foreground" fill="currentColor" />
              </div>
              {siteConfig.name}
            </Link>
            <p className="text-sm text-muted-foreground">{siteConfig.tagline}</p>
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
          <p className="text-sm text-muted-foreground">© {currentYear} {siteConfig.name}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href={siteConfig.social.twitter} className="text-sm text-muted-foreground hover:text-foreground">Twitter</Link>
            <Link href={siteConfig.social.github} className="text-sm text-muted-foreground hover:text-foreground">GitHub</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
