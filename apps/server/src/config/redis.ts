import { createClient } from "redis";
import { ENV } from "./env";

export type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | null = null;

/**
 * Get or create Redis client instance
 */
export async function getRedisClient(): Promise<RedisClient> {
  if (redisClient) {
    return redisClient;
  }

  try {
    redisClient = createClient({
      url: ENV.REDIS_URL,
      socket: {
        connectTimeout: 10000,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error("Redis: Max reconnection attempts reached");
            return new Error("Redis max reconnection attempts");
          }
          // Exponential backoff: 50ms * 2^retries
          return Math.min(retries * 100, 3000);
        },
      },
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    redisClient.on("connect", () => {
      console.log("✅ Redis client connected");
    });

    redisClient.on("reconnecting", () => {
      console.log("🔄 Redis client reconnecting...");
    });

    redisClient.on("ready", () => {
      console.log("✅ Redis client ready");
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    throw error;
  }
}

/**
 * Close Redis connection
 */
export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log("Redis client disconnected");
  }
}

/**
 * Check if Redis is connected
 */
export function isRedisConnected(): boolean {
  return redisClient?.isOpen ?? false;
}
