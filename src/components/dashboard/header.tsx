"use client";

import { Bell } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import type { User } from "@/engine/auth/auth";

export function DashboardHeader({ user }: { user: User }) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
      <div />
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{user.name?.[0]?.toUpperCase() ?? "U"}</div>
      </div>
    </header>
  );
}
