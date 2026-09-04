import { auth } from "@/engine/auth/auth";
import { checkAIRateLimit, RateLimitError } from "@/engine/security/rate-limit";
import { headers } from "next/headers";
import { z } from "zod";
import { experimental_generateImage as generateImage, APICallError, NoImageGeneratedError } from "ai";
import { openai } from "@ai-sdk/openai";

const bodySchema = z.object({
  prompt: z.string().min(3).max(1000),
  aspectRatio: z.enum(["1:1", "16:9", "9:16", "4:3"]).default("1:1"),
});

const sizeMap: Record<string, "1024x1024" | "1536x1024" | "1024x1536"> = {
  "1:1": "1024x1024",
  "16:9": "1536x1024",
  "9:16": "1024x1536",
  "4:3": "1024x1024",
};

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });

    await checkAIRateLimit(session.user.id);
    const { prompt, aspectRatio } = parsed.data;

    const result = await generateImage({
      model: openai.image("gpt-image-1"),
      prompt,
      size: sizeMap[aspectRatio] ?? "1024x1024",
      n: 1,
    });

    const image = result.images[0];
    if (!image) return Response.json({ error: "No image generated" }, { status: 500 });

    const mediaType = image.mediaType ?? "image/png";
    return Response.json({ url: `data:${mediaType};base64,${image.base64}` });
  } catch (error) {
    if (error instanceof RateLimitError) return Response.json({ error: error.message }, { status: 429 });

    if (APICallError.isInstance(error)) {
      const isContentPolicy = error.statusCode === 400 && /safety|policy|content/i.test(error.message ?? "");
      if (isContentPolicy) {
        return Response.json({ error: "Your prompt was flagged by the content safety system. Please adjust it and try again." }, { status: 400 });
      }
      if (error.statusCode === 429) {
        return Response.json({ error: "The image provider is rate-limiting requests right now. Please try again shortly." }, { status: 429 });
      }
      console.error("[Image API] Provider error:", error.statusCode, error.message);
      return Response.json({ error: "The image provider returned an error. Please try again." }, { status: 502 });
    }

    if (NoImageGeneratedError.isInstance(error)) {
      return Response.json({ error: "The model couldn't generate an image for this prompt. Try rephrasing it." }, { status: 422 });
    }

    console.error("[Image API] Unexpected error:", error);
    return Response.json({ error: "Image generation failed. Please try again." }, { status: 500 });
  }
}

export const maxDuration = 60;
