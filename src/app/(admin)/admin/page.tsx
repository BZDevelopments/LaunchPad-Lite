import { auth } from "@/engine/auth/auth";
import { headers } from "next/headers";
import { db } from "@/engine/db/client";
import { users, subscriptions, aiUsage, orders, leads } from "@/engine/db/schema";
import { desc, count } from "drizzle-orm";
import { siteConfig } from "@/user-control/site-config";

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const [totalUsers, recentUsers] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.query.users.findMany({ orderBy: [desc(users.createdAt)], limit: 10 }),
  ]);

  const stats = [{ label: "Total Users", value: totalUsers[0]?.count ?? 0 }];

  if (siteConfig.siteType === "saas") {
    const totalSubs = await db.select({ count: count() }).from(subscriptions);
    stats.push({ label: "Active Subscriptions", value: totalSubs[0]?.count ?? 0 });
  }
  if (siteConfig.features.modules.ai) {
    const totalAI = await db.select({ count: count() }).from(aiUsage);
    stats.push({ label: "AI Requests (All Time)", value: totalAI[0]?.count ?? 0 });
  }
  if (siteConfig.features.modules.shop) {
    const totalOrders = await db.select({ count: count() }).from(orders);
    stats.push({ label: "Total Orders", value: totalOrders[0]?.count ?? 0 });
  }
  if (siteConfig.features.modules.leads) {
    const totalLeads = await db.select({ count: count() }).from(leads);
    stats.push({ label: "Total Leads", value: totalLeads[0]?.count ?? 0 });
  }

  return (
    <div>
      <div className="mb-8">
        <div className="mb-3 inline-flex items-center rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">Admin Panel</div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>System Overview</h1>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4"><h2 className="font-semibold text-foreground">Recent Signups</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-6 py-3 font-medium text-muted-foreground">Name</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Email</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Role</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="px-6 py-3 text-foreground">{u.name}</td>
                  <td className="px-6 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-6 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{u.role}</span></td>
                  <td className="px-6 py-3 text-muted-foreground">{u.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
