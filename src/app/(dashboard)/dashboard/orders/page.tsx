import { auth } from "@/engine/auth/auth";
import { headers } from "next/headers";
import { db } from "@/engine/db/client";
import { orders } from "@/engine/db/schema";
import { desc } from "drizzle-orm";
import { siteConfig } from "@/user-control/site-config";
import { Receipt } from "lucide-react";

export default async function OrdersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const rows = await db.query.orders.findMany({ orderBy: [desc(orders.createdAt)], with: { items: true }, limit: 100 });
  const symbol = siteConfig.commerce.currencySymbol;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">All customer orders, most recent first.</p>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><Receipt className="h-7 w-7 text-primary" /></div>
          <h3 className="font-semibold text-foreground">No orders yet</h3>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-6 py-3 font-medium text-muted-foreground">Customer</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Items</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Total</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30">
                  <td className="px-6 py-3 text-foreground">{order.customerEmail}</td>
                  <td className="px-6 py-3 text-muted-foreground">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</td>
                  <td className="px-6 py-3 font-medium text-foreground">{symbol}{(order.totalCents / 100).toFixed(2)}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${order.status === "paid" || order.status === "fulfilled" ? "bg-green-500/10 text-green-600" : order.status === "canceled" || order.status === "refunded" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>{order.status}</span>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">{order.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
