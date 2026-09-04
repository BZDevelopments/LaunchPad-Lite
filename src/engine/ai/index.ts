import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { streamText, generateText, convertToModelMessages, type LanguageModel, type UIMessage } from "ai";
import { siteConfig } from "@/user-control/site-config";
import { checkAIRateLimit } from "@/engine/security/rate-limit";
import { db } from "@/engine/db/client";
import { aiUsage } from "@/engine/db/schema";

type AIProvider = "openai" | "anthropic" | "google";

interface ModelOptions {
  provider?: AIProvider;
  model?: string;
}

export function getModel(options?: ModelOptions): LanguageModel {
  const provider = options?.provider ?? siteConfig.ai.defaultProvider;
  const model = options?.model ?? siteConfig.ai.defaultModel;
  switch (provider) {
    case "openai":
      return openai(model);
    case "anthropic":
      return anthropic(model);
    case "google":
      return google(model);
    default:
      return openai(model);
  }
}

interface StreamChatOptions {
  userId: string;
  messages: UIMessage[];
  systemPrompt?: string;
  model?: ModelOptions;
  maxOutputTokens?: number;
}

export async function streamChat(options: StreamChatOptions) {
  const { userId, messages, systemPrompt, model, maxOutputTokens } = options;
  await checkAIRateLimit(userId);
  const aiModel = getModel(model);

  const result = streamText({
    model: aiModel,
    system: systemPrompt ?? siteConfig.ai.systemPrompt,
    messages: convertToModelMessages(messages),
    maxOutputTokens: maxOutputTokens ?? siteConfig.ai.maxTokens,
    onFinish: async ({ totalUsage }) => {
      void trackUsage({
        userId,
        provider: (model?.provider ?? siteConfig.ai.defaultProvider) as AIProvider,
        modelName: model?.model ?? siteConfig.ai.defaultModel,
        usage: {
          promptTokens: totalUsage.inputTokens ?? 0,
          completionTokens: totalUsage.outputTokens ?? 0,
          totalTokens: totalUsage.totalTokens ?? 0,
        },
        feature: "chat",
      });
    },
  });

  return result;
}

async function trackUsage({
  userId,
  provider,
  modelName,
  usage,
  feature,
}: {
  userId: string;
  provider: AIProvider;
  modelName: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
  feature: string;
}) {
  try {
    await db.insert(aiUsage).values({
      userId,
      provider,
      model: modelName,
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      totalTokens: usage.totalTokens,
      feature,
    });
  } catch (error) {
    console.error("[AI Usage Tracking] Failed to record usage:", error);
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const { embed } = await import("ai");
  const { embedding } = await embed({ model: openai.embedding("text-embedding-3-small"), value: text });
  return embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const { embedMany } = await import("ai");
  const { embeddings } = await embedMany({
    model: openai.embedding("text-embedding-3-small"),
    values: texts,
    maxParallelCalls: 5,
  });
  return embeddings;
}

export async function generateOnce(prompt: string, options?: ModelOptions): Promise<string> {
  const { text } = await generateText({ model: getModel(options), prompt, maxOutputTokens: 500 });
  return text;
}
