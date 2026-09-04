"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowLeft, Upload, FileText, Loader2, CheckCircle2, XCircle, Send, Bot, User, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Document { id: string; name: string; status: "uploading" | "processing" | "ready" | "error"; chunkCount: number; createdAt: string; }

export function KnowledgeBaseDetailClient({ knowledgeBase, initialDocuments }: { knowledgeBase: { id: string; name: string; description: string | null }; initialDocuments: Document[] }) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [tab, setTab] = useState<"documents" | "chat">("documents");

  return (
    <div>
      <Link href="/dashboard/knowledge-base" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Knowledge Bases
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>{knowledgeBase.name}</h1>
        {knowledgeBase.description && <p className="mt-1 text-sm text-muted-foreground">{knowledgeBase.description}</p>}
      </div>

      <div className="mb-6 flex gap-1 rounded-xl border border-border bg-muted p-1 w-fit">
        <button onClick={() => setTab("documents")} className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${tab === "documents" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>Documents</button>
        <button onClick={() => setTab("chat")} className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${tab === "chat" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>Chat</button>
      </div>

      {tab === "documents" ? <DocumentsPanel knowledgeBaseId={knowledgeBase.id} documents={documents} setDocuments={setDocuments} /> : <ChatPanel knowledgeBaseId={knowledgeBase.id} />}
    </div>
  );
}

function DocumentsPanel({ knowledgeBaseId, documents, setDocuments }: { knowledgeBaseId: string; documents: Document[]; setDocuments: React.Dispatch<React.SetStateAction<Document[]>> }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["txt", "md"].includes(ext)) {
      toast.error("For now, upload .txt or .md files.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setUploading(true);
    try {
      const content = await file.text();
      const res = await fetch("/api/ai/rag/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ knowledgeBaseId, name: file.name, content }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Upload failed"); return; }
      setDocuments((prev) => [{ id: data.document.id, name: data.document.name, status: data.document.status, chunkCount: data.document.chunkCount ?? 0, createdAt: data.document.createdAt ?? new Date().toISOString() }, ...prev]);
      toast.success(`${file.name} processed`);
    } catch {
      toast.error("Something went wrong during upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="mb-6 rounded-xl border border-dashed border-border bg-card p-8 text-center">
        <input ref={fileInputRef} type="file" accept=".txt,.md" onChange={handleFileSelect} className="hidden" id="kb-file-upload" />
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          {uploading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <Upload className="h-6 w-6 text-primary" />}
        </div>
        <label htmlFor="kb-file-upload" className="cursor-pointer text-sm font-medium text-primary hover:underline">{uploading ? "Processing..." : "Click to upload a .txt or .md file"}</label>
      </div>

      {documents.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">No documents yet.</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.chunkCount} chunk{doc.chunkCount !== 1 ? "s" : ""} · {new Date(doc.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <StatusBadge status={doc.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Document["status"] }) {
  const config = {
    ready: { icon: CheckCircle2, label: "Ready", className: "text-green-600 bg-green-500/10" },
    processing: { icon: Loader2, label: "Processing", className: "text-primary bg-primary/10 animate-pulse" },
    uploading: { icon: Loader2, label: "Uploading", className: "text-primary bg-primary/10 animate-pulse" },
    error: { icon: XCircle, label: "Error", className: "text-destructive bg-destructive/10" },
  }[status];
  const Icon = config.icon;
  return <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}><Icon className="h-3 w-3" />{config.label}</span>;
}

function ChatPanel({ knowledgeBaseId }: { knowledgeBaseId: string }) {
  const [input, setInput] = useState("");
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/ai/rag/chat", body: { knowledgeBaseId } }), [knowledgeBaseId]);
  const { messages, sendMessage, status, error } = useChat({ transport });
  const isLoading = status === "submitted" || status === "streaming";
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  return (
    <div className="flex h-[600px] flex-col">
      <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><Bot className="h-7 w-7 text-primary" /></div>
            <h3 className="font-semibold text-foreground">Ask about your documents</h3>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 px-6 py-5 ${msg.role === "assistant" ? "bg-muted/30" : ""}`}>
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${msg.role === "assistant" ? "bg-primary/10" : "bg-muted border border-border"}`}>
                  {msg.role === "assistant" ? <Bot className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="min-w-0 flex-1 prose prose-sm dark:prose-invert">
                  {msg.parts.map((part, i) => part.type === "text" ? (msg.role === "assistant" ? <ReactMarkdown key={i} remarkPlugins={[remarkGfm]}>{part.text}</ReactMarkdown> : <p key={i} className="text-sm text-foreground whitespace-pre-wrap">{part.text}</p>) : null)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4 bg-muted/30 px-6 py-5">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10"><Bot className="h-4 w-4 text-primary" /></div>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && <div className="mt-3 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"><AlertCircle className="h-4 w-4 flex-shrink-0" />{error.message}</div>}

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex items-end gap-3 rounded-xl border border-border bg-card p-3">
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }} placeholder="Ask about your documents..." rows={1} disabled={isLoading} className="max-h-40 flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50" />
          <button type="submit" disabled={!input.trim() || isLoading} className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"><Send className="h-4 w-4" /></button>
        </div>
      </form>
    </div>
  );
}
