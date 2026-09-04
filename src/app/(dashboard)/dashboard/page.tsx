import { auth } from "@/engine/auth/auth";
import { headers } from "next/headers";
import { db } from "@/engine/db/client";
import { aiUsage, subscriptions, orders, leads, posts, products } from "@/engine/db/schema";
import { eq, and, gte, sql, count } from "drizzle-orm";
import { siteConfig } from "@/user-control/site-config";
import { getPlanById } from "@/user-control/plans-config";
import { Brain, CreditCard, Receipt, Inbox, FileText, ShoppingBag } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const stats = await buildStats(session.user.id);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          Good to see you, {session.user.name?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">Here's an overview of your {siteConfig.name} workspace.</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"><stat.icon className="h-4 w-4 text-primary" /></div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="mt-1 text-xs capitalize text-muted-foreground">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-semibold text-foreground">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {buildQuickActions().map((action) => (
            <a key={action.href} href={action.href} className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              <action.icon className="h-4 w-4 text-primary" /> {action.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

async function buildStats(userId: string) {
  const stats: Array<{ icon: typeof Brain; label: string; value: string; sub: string }> = [];

  if (siteConfig.siteType === "saas") {
    const sub = await db.query.subscriptions.findFirst({ where: eq(subscriptions.userId, userId) });
    const plan = getPlanById(sub?.planId ?? "free");
    stats.push({
      icon: CreditCard,
      label: "Current Plan",
      value: plan?.name ?? "Free",
      sub: sub?.status ?? "active",
    });
  }

  if (siteConfig.features.modules.ai) {
    const todayUsage = await db
      .select({ total: sql<number>`count(*)` })
      .from(aiUsage)
      .where(and(eq(aiUsage.userId, userId), gte(aiUsage.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000))));
    stats.push({ icon: Brain, label: "AI Requests Today", value: String(todayUsage[0]?.total ?? 0), sub: "last 24 hours" });
  }

  if (siteConfig.features.modules.shop) {
    const orderCount = await db.select({ total: count() }).from(orders);
    stats.push({ icon: Receipt, label: "Total Orders", value: String(orderCount[0]?.total ?? 0), sub: "all time" });
    const productCount = await db.select({ total: count() }).from(products).where(eq(products.ownerId, userId));
    stats.push({ icon: ShoppingBag, label: "Products", value: String(productCount[0]?.total ?? 0), sub: "listed" });
  }

  if (siteConfig.features.modules.leads) {
    const newLeads = await db.select({ total: count() }).from(leads).where(eq(leads.status, "new"));
    stats.push({ icon: Inbox, label: "New Leads", value: String(newLeads[0]?.total ?? 0), sub: "awaiting response" });
  }

  if (siteConfig.features.modules.content) {
    const postCount = await db.select({ total: count() }).from(posts).where(eq(posts.authorId, userId));
    stats.push({ icon: FileText, label: "Posts", value: String(postCount[0]?.total ?? 0), sub: "total drafts + published" });
  }

  return stats.slice(0, 4);
}

function buildQuickActions() {
  const actions: Array<{ href: string; label: string; icon: typeof Brain }> = [];
  if (siteConfig.features.modules.ai && siteConfig.features.ai.chat) actions.push({ href: "/dashboard/chat", label: "Open AI Chat", icon: Brain });
  if (siteConfig.features.modules.ai && siteConfig.features.ai.imageGeneration) actions.push({ href: "/dashboard/image-lab", label: "Generate Image", icon: Brain });
  if (siteConfig.features.modules.shop) actions.push({ href: "/dashboard/products", label: "Add a Product", icon: ShoppingBag });
  if (siteConfig.features.modules.content) actions.push({ href: "/dashboard/posts", label: "Write a Post", icon: FileText });
  if (siteConfig.features.modules.leads) actions.push({ href: "/dashboard/leads", label: "View Leads", icon: Inbox });
  if (siteConfig.features.modules.projects) actions.push({ href: "/dashboard/projects", label: "Add a Project", icon: Receipt });
  return actions;
}
