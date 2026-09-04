import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { siteConfig } from "@/user-control/site-config";

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

const hasRedis = !!getRedis();
if (!hasRedis && process.env.NODE_ENV === "production") {
  console.warn(
    "\n⚠️  UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set.\n" +
    "   Falling back to in-memory rate limiting, which does not share state\n" +
    "   across multiple server instances. Configure Upstash Redis before\n" +
    "   scaling beyond a single instance: https://console.upstash.com\n"
  );
}

interface MemoryWindow {
  timestamps: number[];
}
const memoryStore = new Map<string, MemoryWindow>();

setInterval(() => {
  const now = Date.now();
  for (const [key, window] of memoryStore.entries()) {
    window.timestamps = window.timestamps.filter((t) => now - t < 24 * 60 * 60 * 1000);
    if (window.timestamps.length === 0) memoryStore.delete(key);
  }
}, 5 * 60 * 1000).unref?.();

function windowToMs(window: string): number {
  const [amountStr, unit] = window.split(" ");
  const amount = Number(amountStr);
  switch (unit) {
    case "s": return amount * 1000;
    case "m": return amount * 60 * 1000;
    case "h": return amount * 60 * 60 * 1000;
    case "d": return amount * 24 * 60 * 60 * 1000;
    default: return 60 * 1000;
  }
}

function memoryLimit(key: string, maxRequests: number, window: string) {
  const now = Date.now();
  const windowMs = windowToMs(window);
  const entry = memoryStore.get(key) ?? { timestamps: [] };
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    memoryStore.set(key, entry);
    const oldestInWindow = entry.timestamps[0] ?? now;
    return { success: false, remaining: 0, reset: oldestInWindow + windowMs };
  }

  entry.timestamps.push(now);
  memoryStore.set(key, entry);
  return { success: true, remaining: maxRequests - entry.timestamps.length, reset: now + windowMs };
}

let aiPerMinuteLimiter: Ratelimit | null = null;
let aiPerDayLimiter: Ratelimit | null = null;

function getAILimiters() {
  const r = getRedis();
  if (!r) return null;
  if (!aiPerMinuteLimiter) {
    aiPerMinuteLimiter = new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(siteConfig.ai.rateLimit.requestsPerMinute, "1 m"),
      prefix: "launchpad:ai:minute",
    });
  }
  if (!aiPerDayLimiter) {
    aiPerDayLimiter = new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(siteConfig.ai.rateLimit.requestsPerDay, "24 h"),
      prefix: "launchpad:ai:day",
    });
  }
  return { aiPerMinuteLimiter, aiPerDayLimiter };
}

export class RateLimitError extends Error {
  constructor(message: string, public readonly resetAt: Date) {
    super(message);
    this.name = "RateLimitError";
  }
}

export async function checkAIRateLimit(userId: string): Promise<void> {
  const limiters = getAILimiters();

  if (!limiters) {
    const minuteResult = memoryLimit(`ai:minute:${userId}`, siteConfig.ai.rateLimit.requestsPerMinute, "1 m");
    if (!minuteResult.success) {
      throw new RateLimitError(
        `Too many requests. You can make ${siteConfig.ai.rateLimit.requestsPerMinute} AI requests per minute.`,
        new Date(minuteResult.reset)
      );
    }
    const dayResult = memoryLimit(`ai:day:${userId}`, siteConfig.ai.rateLimit.requestsPerDay, "24 h");
    if (!dayResult.success) {
      throw new RateLimitError(
        `Daily AI request limit reached (${siteConfig.ai.rateLimit.requestsPerDay}/day). Resets at midnight.`,
        new Date(dayResult.reset)
      );
    }
    return;
  }

  const { aiPerMinuteLimiter, aiPerDayLimiter } = limiters;
  const minuteResult = await aiPerMinuteLimiter.limit(userId);
  if (!minuteResult.success) {
    throw new RateLimitError(
      `Too many requests. You can make ${siteConfig.ai.rateLimit.requestsPerMinute} AI requests per minute.`,
      new Date(minuteResult.reset)
    );
  }
  const dayResult = await aiPerDayLimiter.limit(userId);
  if (!dayResult.success) {
    throw new RateLimitError(
      `Daily AI request limit reached (${siteConfig.ai.rateLimit.requestsPerDay}/day). Resets at midnight.`,
      new Date(dayResult.reset)
    );
  }
}

export async function rateLimit(
  identifier: string,
  maxRequests: number,
  window: "1 m" | "10 m" | "1 h" | "24 h" = "1 m"
): Promise<{ success: boolean; remaining: number; reset: Date }> {
  const r = getRedis();
  if (!r) {
    const result = memoryLimit(`generic:${identifier}`, maxRequests, window);
    return { success: result.success, remaining: result.remaining, reset: new Date(result.reset) };
  }
  const limiter = new Ratelimit({ redis: r, limiter: Ratelimit.slidingWindow(maxRequests, window), prefix: "launchpad:generic" });
  const result = await limiter.limit(identifier);
  return { success: result.success, remaining: result.remaining, reset: new Date(result.reset) };
}
