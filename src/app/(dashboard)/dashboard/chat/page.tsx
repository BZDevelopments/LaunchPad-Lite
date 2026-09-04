"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send, Bot, User, AlertCircle, Loader2 } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/ai/chat" }), []);
  const { messages, sendMessage, status, error, stop } = useChat({ transport });
  const isLoading = status === "submitted" || status === "streaming";

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>AI Chat</h1>
        <p className="text-sm text-muted-foreground">Responses stream in real-time.</p>
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><Bot className="h-7 w-7 text-primary" /></div>
            <h3 className="font-semibold text-foreground">How can I help you today?</h3>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 px-6 py-5 ${msg.role === "assistant" ? "bg-muted/30" : ""}`}>
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${msg.role === "assistant" ? "bg-primary/10" : "bg-muted border border-border"}`}>
                  {msg.role === "assistant" ? <Bot className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="min-w-0 flex-1 prose prose-sm dark:prose-invert">
                  {msg.parts.map((part, i) => {
                    if (part.type !== "text") return null;
                    return msg.role === "assistant" ? (
                      <ReactMarkdown key={i} remarkPlugins={[remarkGfm]}>{part.text}</ReactMarkdown>
                    ) : (
                      <p key={i} className="text-sm text-foreground whitespace-pre-wrap">{part.text}</p>
                    );
                  })}
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

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error.message}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="mt-4">
        <div className="flex items-end gap-3 rounded-xl border border-border bg-card p-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Message AI... (Enter to send, Shift+Enter for new line)"
            rows={1}
            disabled={isLoading}
            className="max-h-40 flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
          />
          {isLoading ? (
            <button type="button" onClick={stop} className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
              <Loader2 className="h-4 w-4 animate-spin" />
            </button>
          ) : (
            <button type="submit" disabled={!input.trim()} className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40">
              <Send className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
