"use client";

import { useState } from "react";
import { Plus, Loader2, X, Trash2, FolderKanban, Star } from "lucide-react";
import toast from "react-hot-toast";

interface Project { id: string; slug: string; title: string; summary: string | null; published: boolean; featured: boolean; tags: string[]; }

export function ProjectsClient({ initialProjects }: { initialProjects: Project[] }) {
  const [items, setItems] = useState(initialProjects);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { toast.error("Title is required"); return; }
    setCreating(true);
    try {
      const res = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, summary: summary || undefined, externalUrl: externalUrl || undefined }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed to create project"); return; }
      setItems((prev) => [...prev, { id: data.project.id, slug: data.project.slug, title: data.project.title, summary: data.project.summary, published: data.project.published, featured: data.project.featured, tags: data.project.tags ?? [] }]);
      setShowCreate(false); setTitle(""); setSummary(""); setExternalUrl("");
      toast.success("Project added");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(project: Project, field: "published" | "featured") {
    const value = !project[field];
    const res = await fetch("/api/projects", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: project.id, [field]: value }) });
    if (res.ok) setItems((prev) => prev.map((p) => (p.id === project.id ? { ...p, [field]: value } : p)));
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this project?")) return;
    const res = await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">Case studies shown on your homepage.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> Add Project
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">New Project</h3>
            <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project title" className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Short summary" rows={2} className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <input type="url" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="Link to live project (optional)" className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <button type="submit" disabled={creating} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
              {creating && <Loader2 className="h-4 w-4 animate-spin" />} Create
            </button>
          </form>
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><FolderKanban className="h-7 w-7 text-primary" /></div>
          <h3 className="font-semibold text-foreground">No projects yet</h3>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((project) => (
            <div key={project.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
              <div>
                <p className="font-medium text-foreground">{project.title}</p>
                {project.summary && <p className="text-sm text-muted-foreground line-clamp-1">{project.summary}</p>}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => handleToggle(project, "featured")} className={project.featured ? "text-primary" : "text-muted-foreground hover:text-foreground"}>
                  <Star className="h-4 w-4" fill={project.featured ? "currentColor" : "none"} />
                </button>
                <button onClick={() => handleToggle(project, "published")} className={`rounded-full px-3 py-1 text-xs font-semibold ${project.published ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
                  {project.published ? "Published" : "Hidden"}
                </button>
                <button onClick={() => handleDelete(project.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
