import "server-only";
import Redis from "ioredis";

const rateMemory = new Map<string, { count: number; expiresAt: number }>();
const eventMemory = new Map<string, number>();
let redis: Redis | null | undefined;

async function client(): Promise<Redis | null> {
  if (redis === undefined) {
    redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 1000,
      retryStrategy: () => null,
    }) : null;
    redis?.on("error", () => {});
  }
  if (redis?.status === "wait") await redis.connect().catch(() => null);
  return redis?.status === "ready" ? redis : null;
}

function pruneMemory(now = Date.now()) {
  for (const [key, value] of rateMemory) if (value.expiresAt <= now) rateMemory.delete(key);
  for (const [key, expiresAt] of eventMemory) if (expiresAt <= now) eventMemory.delete(key);
  if (rateMemory.size + eventMemory.size > 10_000) for (const key of rateMemory.keys()) {
    rateMemory.delete(key);
    if (rateMemory.size + eventMemory.size <= 9_000) break;
  }
}

export async function rateLimited(key: string, limit: number, ttlSeconds = 60): Promise<boolean> {
  const store = await client();
  if (store) {
    const redisKey = `cms:frontend:rate:${key}:${Math.floor(Date.now() / (ttlSeconds * 1000))}`;
    const count = await store.incr(redisKey);
    if (count === 1) await store.expire(redisKey, ttlSeconds + 1);
    return count > limit;
  }
  const bucket = `${key}:${Math.floor(Date.now() / (ttlSeconds * 1000))}`;
  const current = rateMemory.get(bucket);
  const value = { count: (current?.count || 0) + 1, expiresAt: Date.now() + ttlSeconds * 1000 };
  rateMemory.set(bucket, value);
  if (rateMemory.size + eventMemory.size > 10_000) pruneMemory();
  return value.count > limit;
}

export async function claimEvent(eventId: string, ttlSeconds = 600): Promise<boolean> {
  const store = await client();
  if (store) return (await store.set(`cms:frontend:event:${eventId}`, "1", "EX", ttlSeconds, "NX")) === "OK";
  pruneMemory();
  const key = `event:${eventId}`;
  if ((eventMemory.get(key) || 0) > Date.now()) return false;
  eventMemory.set(key, Date.now() + ttlSeconds * 1000);
  return true;
}

export async function releaseEvent(eventId: string) {
  const store = await client();
  if (store) await store.del(`cms:frontend:event:${eventId}`);
  eventMemory.delete(`event:${eventId}`);
}
