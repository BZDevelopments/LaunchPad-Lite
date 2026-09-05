import { auth } from "@/engine/auth/auth";
import { headers } from "next/headers";
import { db } from "@/engine/db/client";
import { user } from "@/engine/db/schema";
import { count } from "drizzle-orm";
import { Users } from "lucide-react";

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") return null;

  const rows = await db.select({ total: count() }).from(user);
  const total = rows[0]?.total ?? 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          Admin Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">Manage your LaunchPad Lite application.</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{total}</p>
          <p className="mt-1 text-xs text-muted-foreground">registered</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        Upgrade to{" "}
        <a href="https://launchpad-checkout.netlify.app/" className="font-medium text-primary hover:underline">
          LaunchPad Pro
        </a>{" "}
        for full admin controls, subscription tracking, and more.
      </div>
    </div>
  );
}
