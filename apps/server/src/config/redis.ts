import { createClient } from "redis";
import { ENV } from "./env";
import { logger } from "../utils/logger";

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
            logger.error("Redis: Max reconnection attempts reached");
            return new Error("Redis max reconnection attempts");
          }
          // Exponential backoff: 50ms * 2^retries
          return Math.min(retries * 100, 3000);
        },
      },
    });

    redisClient.on("error", (err) => {
      logger.error("Redis Client Error:", err);
    });

    redisClient.on("connect", () => {
      logger.info("✅ Redis client connected");
    });

    redisClient.on("reconnecting", () => {
      logger.info("🔄 Redis client reconnecting...");
    });

    redisClient.on("ready", () => {
      logger.info("✅ Redis client ready");
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error("Failed to connect to Redis:", error);
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
    logger.info("Redis client disconnected");
  }
}

/**
 * Check if Redis is connected
 */
export function isRedisConnected(): boolean {
  return redisClient?.isOpen ?? false;
}
