"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";

interface KBSummary { id: string; name: string; description: string | null; documentCount: number; createdAt: string; }

export function KnowledgeBaseListClient({ initialKnowledgeBases }: { initialKnowledgeBases: KBSummary[] }) {
  const router = useRouter();
  const [kbs, setKbs] = useState(initialKnowledgeBases);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/knowledge-base", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description: description || undefined }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed to create knowledge base"); return; }
      const newKb = data.knowledgeBase;
      setKbs((prev) => [{ id: newKb.id, name: newKb.name, description: newKb.description, documentCount: 0, createdAt: newKb.createdAt }, ...prev]);
      setShowCreate(false); setName(""); setDescription("");
      router.push(`/dashboard/knowledge-base/${newKb.id}`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Knowledge Base</h1>
          <p className="mt-1 text-sm text-muted-foreground">Upload documents and chat with your data using RAG.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> New Knowledge Base
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Create Knowledge Base</h3>
            <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Product Documentation" className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Description <span className="text-muted-foreground">(optional)</span></label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this is for" className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <button type="submit" disabled={creating} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
              {creating && <Loader2 className="h-4 w-4 animate-spin" />} Create
            </button>
          </form>
        </div>
      )}

      {kbs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><BookOpen className="h-7 w-7 text-primary" /></div>
          <h3 className="mb-1 font-semibold text-foreground">No knowledge bases yet</h3>
          <p className="mb-6 max-w-xs text-sm text-muted-foreground">Create one, upload documents, and chat with your data.</p>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4" /> Create Knowledge Base
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kbs.map((kb) => (
            <Link key={kb.id} href={`/dashboard/knowledge-base/${kb.id}`} className="group rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><BookOpen className="h-5 w-5 text-primary" /></div>
              <h3 className="mb-1 font-semibold text-foreground">{kb.name}</h3>
              {kb.description && <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{kb.description}</p>}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{kb.documentCount} document{kb.documentCount !== 1 ? "s" : ""}</span>
                <span className="text-xs text-muted-foreground">{new Date(kb.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
