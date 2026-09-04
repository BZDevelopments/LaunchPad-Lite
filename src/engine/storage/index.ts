import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { siteConfig } from "@/user-control/site-config";

function createStorageClient(): S3Client {
  const isR2 = siteConfig.storage.provider === "r2";
  if (isR2) {
    const accountId = process.env.R2_ACCOUNT_ID;
    if (!accountId) throw new Error("R2_ACCOUNT_ID is not set");
    return new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
      },
    });
  }
  return new S3Client({
    region: process.env.AWS_REGION ?? "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    },
  });
}

const globalForStorage = globalThis as unknown as { storage: S3Client | undefined };
const storageClient = globalForStorage.storage ?? createStorageClient();
if (process.env.NODE_ENV !== "production") globalForStorage.storage = storageClient;

const BUCKET = siteConfig.storage.bucketName;

export function generateStorageKey(userId: string, filename: string): string {
  const timestamp = Date.now();
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `uploads/${userId}/${timestamp}-${safe}`;
}

export function validateFile(filename: string, sizeBytes: number, contentType: string): void {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  // siteConfig is `as const`, so allowedFileTypes is a readonly literal
  // tuple — cast to readonly string[] since we're only checking membership.
  const allowed: readonly string[] = siteConfig.storage.allowedFileTypes;
  if (!allowed.includes(ext)) {
    throw new Error(`File type .${ext} is not allowed. Allowed: ${siteConfig.storage.allowedFileTypes.join(", ")}`);
  }
  const maxBytes = siteConfig.storage.maxFileSizeMB * 1024 * 1024;
  if (sizeBytes > maxBytes) {
    throw new Error(`File too large. Maximum size is ${siteConfig.storage.maxFileSizeMB}MB.`);
  }
}

export async function getUploadPresignedUrl(key: string, contentType: string, expiresInSeconds = 300): Promise<string> {
  const command = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType });
  return getSignedUrl(storageClient, command, { expiresIn: expiresInSeconds });
}

export async function getDownloadPresignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(storageClient, command, { expiresIn: expiresInSeconds });
}

export async function deleteFile(key: string): Promise<void> {
  await storageClient.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export async function uploadBuffer(key: string, body: Buffer | Uint8Array, contentType: string): Promise<void> {
  await storageClient.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }));
}
