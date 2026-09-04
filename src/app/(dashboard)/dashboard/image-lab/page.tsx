"use client";

import { useState } from "react";
import { Image as ImageIcon, Loader2, Download, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3"] as const;
const STYLES = ["photorealistic", "digital art", "oil painting", "anime", "minimalist", "3D render"] as const;

export default function ImageLabPage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<(typeof STYLES)[number]>("photorealistic");
  const [aspectRatio, setAspectRatio] = useState<(typeof ASPECT_RATIOS)[number]>("1:1");
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: `${prompt}, ${style}`, aspectRatio }) });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) setGeneratedImages((prev) => [data.url!, ...prev].slice(0, 12));
      else toast.error(data.error ?? "Failed to generate image");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Image Lab</h1>
        <p className="mt-1 text-sm text-muted-foreground">Generate images with AI.</p>
      </div>

      <div className="mb-8 rounded-xl border border-border bg-card p-6">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Describe your image</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="A serene mountain lake at golden hour..." rows={3} className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Style</label>
              <div className="flex flex-wrap gap-2">
                {STYLES.map((s) => (
                  <button key={s} type="button" onClick={() => setStyle(s)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors capitalize ${style === s ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:text-foreground"}`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Aspect Ratio</label>
              <div className="flex gap-2">
                {ASPECT_RATIOS.map((r) => (
                  <button key={r} type="button" onClick={() => setAspectRatio(r)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${aspectRatio === r ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:text-foreground"}`}>{r}</button>
                ))}
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading || !prompt.trim()} className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:opacity-90 disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Generating..." : "Generate Image"}
          </button>
        </form>
      </div>

      {generatedImages.length > 0 ? (
        <div>
          <h2 className="mb-4 font-semibold text-foreground">Generated Images</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {generatedImages.map((url, i) => (
              <div key={i} className="group relative overflow-hidden rounded-xl border border-border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Generated ${i + 1}`} className="h-64 w-full object-cover" />
                <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <a href={url} download={`image-${i + 1}.png`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-900">
                    <Download className="h-3.5 w-3.5" /> Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><ImageIcon className="h-7 w-7 text-primary" /></div>
          <p className="text-sm text-muted-foreground">Your generated images will appear here</p>
        </div>
      )}
    </div>
  );
}
