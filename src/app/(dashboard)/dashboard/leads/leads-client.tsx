"use client";

import { useState } from "react";
import { Inbox, Mail } from "lucide-react";

interface Lead { id: string; name: string; email: string; company: string | null; message: string; status: "new" | "contacted" | "closed" | "archived"; source: string | null; createdAt: string; }

const statusColors: Record<Lead["status"], string> = {
  new: "bg-primary/10 text-primary",
  contacted: "bg-blue-500/10 text-blue-600",
  closed: "bg-green-500/10 text-green-600",
  archived: "bg-muted text-muted-foreground",
};

export function LeadsClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);

  async function handleStatusChange(id: string, status: Lead["status"]) {
    const res = await fetch("/api/leads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (res.ok) setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Leads</h1>
        <p className="mt-1 text-sm text-muted-foreground">Contact form submissions from your site.</p>
      </div>

      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><Inbox className="h-7 w-7 text-primary" /></div>
          <h3 className="font-semibold text-foreground">No leads yet</h3>
          <p className="text-sm text-muted-foreground">Submissions from your contact form will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <div key={lead.id} className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-foreground">{lead.name}</p>
                  <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-sm text-primary hover:underline"><Mail className="h-3 w-3" />{lead.email}</a>
                  {lead.company && <p className="text-xs text-muted-foreground">{lead.company}</p>}
                </div>
                <select value={lead.status} onChange={(e) => handleStatusChange(lead.id, e.target.value as Lead["status"])} className={`rounded-full border-0 px-3 py-1 text-xs font-semibold capitalize ${statusColors[lead.status]}`}>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="closed">Closed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lead.message}</p>
              <p className="mt-3 text-xs text-muted-foreground">{new Date(lead.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
