import { auth } from "@/engine/auth/auth";
import { streamChat } from "@/engine/ai";
import { RateLimitError } from "@/engine/security/rate-limit";
import { headers } from "next/headers";
import { z } from "zod";
import type { UIMessage } from "ai";

const uiMessagePartSchema = z.object({ type: z.string() }).passthrough();
const uiMessageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(["user", "assistant", "system"]),
  parts: z.array(uiMessagePartSchema).min(1),
});

const bodySchema = z.object({
  messages: z.array(uiMessageSchema).min(1).max(50),
  systemPrompt: z.string().max(2000).optional(),
  model: z.object({ provider: z.enum(["openai", "anthropic", "google"]).optional(), model: z.string().optional() }).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return Response.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const { messages, systemPrompt, model } = parsed.data;
    const result = await streamChat({ userId: session.user.id, messages: messages as UIMessage[], systemPrompt, model });
    return result.toUIMessageStreamResponse();
  } catch (error) {
    if (error instanceof RateLimitError) {
      return Response.json(
        { error: "Rate limit exceeded", message: error.message, resetAt: error.resetAt.toISOString() },
        { status: 429, headers: { "Retry-After": String(Math.ceil((error.resetAt.getTime() - Date.now()) / 1000)) } }
      );
    }
    console.error("[Chat API]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const maxDuration = 60;
