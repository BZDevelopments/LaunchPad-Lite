"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, MessageSquare, Image as ImageIcon, BookOpen,
  Settings, CreditCard, Sparkle, LogOut, ShoppingBag, Receipt,
  FileText, Inbox, FolderKanban,
} from "lucide-react";
import { authClient } from "@/engine/auth/auth-client";
import { siteConfig } from "@/user-control/site-config";
import type { User } from "@/engine/auth/auth";

interface SidebarProps {
  user: User;
}

const baseNav = [{ href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", exact: true }];

// Nav items are conditionally included based on which modules are turned on
// in site-config.ts — this is what makes the dashboard adapt to whatever
// kind of site you're building instead of always showing AI tools.
const moduleNav = [
  ...(siteConfig.features.modules.ai && siteConfig.features.ai.chat ? [{ href: "/dashboard/chat", icon: MessageSquare, label: "AI Chat" }] : []),
  ...(siteConfig.features.modules.ai && siteConfig.features.ai.imageGeneration ? [{ href: "/dashboard/image-lab", icon: ImageIcon, label: "Image Lab" }] : []),
  ...(siteConfig.features.modules.ai && siteConfig.features.ai.knowledgeBase ? [{ href: "/dashboard/knowledge-base", icon: BookOpen, label: "Knowledge Base" }] : []),
  ...(siteConfig.features.modules.shop ? [{ href: "/dashboard/products", icon: ShoppingBag, label: "Products" }] : []),
  ...(siteConfig.features.modules.shop ? [{ href: "/dashboard/orders", icon: Receipt, label: "Orders" }] : []),
  ...(siteConfig.features.modules.content ? [{ href: "/dashboard/posts", icon: FileText, label: "Posts" }] : []),
  ...(siteConfig.features.modules.leads ? [{ href: "/dashboard/leads", icon: Inbox, label: "Leads" }] : []),
  ...(siteConfig.features.modules.projects ? [{ href: "/dashboard/projects", icon: FolderKanban, label: "Projects" }] : []),
];

const endNav = [
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const navItems = [...baseNav, ...moduleNav, ...endNav];

  const isActive = (href: string, exact = false) => (exact ? pathname === href : pathname.startsWith(href));

  return (
    <aside className="hidden w-60 flex-shrink-0 border-r border-border bg-card md:flex md:flex-col">
      <div className="flex items-center gap-2 border-b border-border px-6 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary"><Sparkle className="h-4 w-4 text-primary-foreground" fill="currentColor" /></div>
        <span className="font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>{siteConfig.name}</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href, "exact" in item ? item.exact : false);
            return (
              <li key={item.href}>
                <Link href={item.href} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{user.name?.[0]?.toUpperCase() ?? "U"}</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() =>
            authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  window.location.href = "/";
                },
              },
            })
          }
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </aside>
  );
}
