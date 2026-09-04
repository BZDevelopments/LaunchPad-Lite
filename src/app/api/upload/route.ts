import { auth } from "@/engine/auth/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { generateStorageKey, getUploadPresignedUrl, validateFile } from "@/engine/storage";
import { db } from "@/engine/db/client";
import { files } from "@/engine/db/schema";

const bodySchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1),
  sizeBytes: z.number().positive(),
});

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });

  const { filename, contentType, sizeBytes } = parsed.data;

  try {
    validateFile(filename, sizeBytes, contentType);
    const storageKey = generateStorageKey(session.user.id, filename);
    const uploadUrl = await getUploadPresignedUrl(storageKey, contentType);

    const [file] = await db
      .insert(files)
      .values({ userId: session.user.id, name: filename, storageKey, contentType, sizeBytes, status: "uploading" })
      .returning({ id: files.id });

    return Response.json({ uploadUrl, fileId: file?.id, storageKey });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Upload failed";
    return Response.json({ error: msg }, { status: 400 });
  }
}
