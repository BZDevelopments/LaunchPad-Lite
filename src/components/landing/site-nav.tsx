"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Sparkle } from "lucide-react";
import { siteConfig } from "@/user-control/site-config";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const showAuth = siteConfig.features.requireAuthForDashboard;
  const showCart = siteConfig.features.modules.shop;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkle className="h-4 w-4 text-primary-foreground" fill="currentColor" />
          </div>
          <span className="text-lg" style={{ fontFamily: "var(--font-display)" }}>{siteConfig.name}</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {siteConfig.nav.links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {showCart && (
            <Link href="/cart" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cart
            </Link>
          )}
          {showAuth ? (
            <>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sign in
              </Link>
              <Link href="/register" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                Get started
              </Link>
            </>
          ) : (
            <Link href="/contact" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              Get in touch
            </Link>
          )}
        </div>

        <button className="rounded-md p-2 text-muted-foreground hover:text-foreground md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-border bg-background px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {siteConfig.nav.links.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-muted-foreground" onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            <hr className="border-border" />
            {showAuth ? (
              <>
                <Link href="/login" className="text-sm text-muted-foreground">Sign in</Link>
                <Link href="/register" className="rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground">Get started</Link>
              </>
            ) : (
              <Link href="/contact" className="rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground">Get in touch</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
