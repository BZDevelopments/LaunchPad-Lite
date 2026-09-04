"use client";

import { useState } from "react";
import { Plus, Loader2, X, Trash2, FileText, Eye } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface Post { id: string; slug: string; title: string; excerpt: string | null; status: "draft" | "published"; createdAt: string; }

export function PostsClient({ initialPosts }: { initialPosts: Post[] }) {
  const [items, setItems] = useState(initialPosts);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleCreate(status: "draft" | "published") {
    if (!title.trim() || !content.trim()) { toast.error("Title and content are required"); return; }
    setCreating(true);
    try {
      const res = await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, excerpt: excerpt || undefined, content, status }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed to create post"); return; }
      setItems((prev) => [{ id: data.post.id, slug: data.post.slug, title: data.post.title, excerpt: data.post.excerpt, status: data.post.status, createdAt: data.post.createdAt }, ...prev]);
      setShowCreate(false); setTitle(""); setExcerpt(""); setContent("");
      toast.success(status === "published" ? "Post published" : "Draft saved");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCreating(false);
    }
  }

  async function handleTogglePublish(post: Post) {
    const newStatus = post.status === "published" ? "draft" : "published";
    const res = await fetch("/api/posts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: post.id, status: newStatus }) });
    if (res.ok) setItems((prev) => prev.map((p) => (p.id === post.id ? { ...p, status: newStatus } : p)));
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this post?")) return;
    const res = await fetch(`/api/posts?id=${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Posts</h1>
          <p className="mt-1 text-sm text-muted-foreground">Write and publish blog posts.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> New Post
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">New Post</h3>
            <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>
          <div className="space-y-4">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <input type="text" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short excerpt (optional)" className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your post in Markdown..." rows={10} className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground font-mono focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <div className="flex gap-3">
              <button onClick={() => handleCreate("draft")} disabled={creating} className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-60">
                {creating && <Loader2 className="h-4 w-4 animate-spin" />} Save Draft
              </button>
              <button onClick={() => handleCreate("published")} disabled={creating} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
                {creating && <Loader2 className="h-4 w-4 animate-spin" />} Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><FileText className="h-7 w-7 text-primary" /></div>
          <h3 className="font-semibold text-foreground">No posts yet</h3>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((post) => (
            <div key={post.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
              <div>
                <p className="font-medium text-foreground">{post.title}</p>
                {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-1">{post.excerpt}</p>}
              </div>
              <div className="flex items-center gap-3">
                {post.status === "published" && (
                  <Link href={`/blog/${post.slug}`} target="_blank" className="text-muted-foreground hover:text-foreground"><Eye className="h-4 w-4" /></Link>
                )}
                <button onClick={() => handleTogglePublish(post)} className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${post.status === "published" ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
                  {post.status}
                </button>
                <button onClick={() => handleDelete(post.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
