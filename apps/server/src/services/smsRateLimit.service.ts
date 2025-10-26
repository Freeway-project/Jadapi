import { getRedisClient } from "../config/redis";
import { logger } from "../utils/logger";

/**
 * SMS Rate Limiting & Cost Control Service
 * Prevents excessive SMS sending to reduce AWS costs
 */
export class SmsRateLimitService {
  // Rate limit configurations
  private static readonly LIMITS = {
    // Per phone number limits
    perPhone: {
      otp: { count: 12, windowSeconds: 3600 }, // 3 OTPs per hour per phone
      delivery: { count: 110, windowSeconds: 86400 }, // 10 delivery SMS per day
      booking: { count: 51, windowSeconds: 86400 }, // 5 booking SMS per day
      promotional: { count: 21, windowSeconds: 86400 }, // 2 promotional per day
      transactional: { count: 210, windowSeconds: 86400 }, // 20 total per day
    },
    // Global limits (entire system)
    global: {
      hourly: 100, // 100 SMS per hour globally
      daily: 500, // 500 SMS per day globally
      monthly: 10000, // 10,000 SMS per month globally
    },
    // Cost limits (in USD)
    costs: {
      dailyLimit: 10, // $10 per day max
      monthlyLimit: 200, // $200 per month max
      perSmsCost: 0.0075, // $0.0075 per SMS (AWS SNS Canada rate)
    },
    // Cooldown periods
    cooldown: {
      sameMessage: 300, // 5 minutes before sending same message to same number
      afterFailure: 60, // 1 minute cooldown after failed attempt
    },
  };

  /**
   * Check if SMS can be sent based on all rate limits
   */
  static async canSendSms(
    phoneE164: string,
    type: "otp" | "delivery" | "booking" | "promotional" | "transactional",
    message?: string
  ): Promise<{ allowed: boolean; reason?: string; retryAfter?: number }> {
    try {
      // 1. Check per-phone rate limit
      const phoneCheck = await this.checkPhoneRateLimit(phoneE164, type);
      if (!phoneCheck.allowed) {
        return phoneCheck;
      }

      // 2. Check duplicate message cooldown
      if (message) {
        const duplicateCheck = await this.checkDuplicateMessage(phoneE164, message);
        if (!duplicateCheck.allowed) {
          return duplicateCheck;
        }
      }

      // 3. Check global rate limits
      const globalCheck = await this.checkGlobalRateLimit();
      if (!globalCheck.allowed) {
        return globalCheck;
      }

      // 4. Check cost limits
      const costCheck = await this.checkCostLimit();
      if (!costCheck.allowed) {
        return costCheck;
      }

      return { allowed: true };
    } catch (error) {
      logger.error({ error, phoneE164, type }, "SmsRateLimitService.canSendSms - Error checking rate limit");
      // Fail open - allow SMS if rate limit check fails (but log it)
      logger.warn({ phoneE164, type }, "Rate limit check failed, allowing SMS");
      return { allowed: true };
    }
  }

  /**
   * Record successful SMS send
   */
  static async recordSmsSent(
    phoneE164: string,
    type: string,
    message: string
  ): Promise<void> {
    try {
      const redis = await getRedisClient();
      const now = Date.now();

      // Record per-phone
      const phoneKey = `sms:phone:${phoneE164}:${type}`;
      await redis.zAdd(phoneKey, { score: now, value: now.toString() });

      const limit = this.LIMITS.perPhone[type as keyof typeof this.LIMITS.perPhone];
      if (limit) {
        await redis.expire(phoneKey, limit.windowSeconds);
      }

      // Record global counts
      await redis.incr("sms:global:hourly");
      await redis.expire("sms:global:hourly", 3600);

      await redis.incr("sms:global:daily");
      await redis.expire("sms:global:daily", 86400);

      await redis.incr("sms:global:monthly");
      await redis.expire("sms:global:monthly", 2592000); // 30 days

      // Record cost
      const cost = this.LIMITS.costs.perSmsCost;
      await redis.incrByFloat("sms:cost:daily", cost);
      await redis.expire("sms:cost:daily", 86400);

      await redis.incrByFloat("sms:cost:monthly", cost);
      await redis.expire("sms:cost:monthly", 2592000);

      // Record message hash for duplicate detection
      const msgHash = this.hashMessage(message);
      const dupKey = `sms:dup:${phoneE164}:${msgHash}`;
      await redis.set(dupKey, "1", { EX: this.LIMITS.cooldown.sameMessage });

      logger.info({ phoneE164, type, cost }, "SMS sent and recorded");
    } catch (error) {
      logger.error({ error, phoneE164, type }, "SmsRateLimitService.recordSmsSent - Failed to record SMS");
    }
  }

  /**
   * Record failed SMS attempt
   */
  static async recordSmsFailure(phoneE164: string, type: string): Promise<void> {
    try {
      const redis = await getRedisClient();
      const failKey = `sms:fail:${phoneE164}`;
      await redis.set(failKey, "1", { EX: this.LIMITS.cooldown.afterFailure });
      logger.warn({ phoneE164, type }, "SMS failure recorded - cooldown applied");
    } catch (error) {
      logger.error({ error }, "Failed to record SMS failure");
    }
  }

  /**
   * Get current SMS usage statistics
   */
  static async getUsageStats(): Promise<{
    hourly: number;
    daily: number;
    monthly: number;
    costDaily: number;
    costMonthly: number;
    limits: typeof SmsRateLimitService.LIMITS;
  }> {
    try {
      const redis = await getRedisClient();

      const [hourly, daily, monthly, costDaily, costMonthly] = await Promise.all([
        redis.get("sms:global:hourly"),
        redis.get("sms:global:daily"),
        redis.get("sms:global:monthly"),
        redis.get("sms:cost:daily"),
        redis.get("sms:cost:monthly"),
      ]);

      return {
        hourly: parseInt(hourly || "0"),
        daily: parseInt(daily || "0"),
        monthly: parseInt(monthly || "0"),
        costDaily: parseFloat(costDaily || "0"),
        costMonthly: parseFloat(costMonthly || "0"),
        limits: this.LIMITS,
      };
    } catch (error) {
      logger.error({ error }, "Failed to get SMS usage stats");
      return {
        hourly: 0,
        daily: 0,
        monthly: 0,
        costDaily: 0,
        costMonthly: 0,
        limits: this.LIMITS,
      };
    }
  }

  // Private helper methods

  private static async checkPhoneRateLimit(
    phoneE164: string,
    type: string
  ): Promise<{ allowed: boolean; reason?: string; retryAfter?: number }> {
    const redis = await getRedisClient();
    const limit = this.LIMITS.perPhone[type as keyof typeof this.LIMITS.perPhone];

    if (!limit) {
      return { allowed: true };
    }

    const phoneKey = `sms:phone:${phoneE164}:${type}`;
    const cutoff = Date.now() - limit.windowSeconds * 1000;

    // Remove old entries
    await redis.zRemRangeByScore(phoneKey, 0, cutoff);

    // Count recent sends
    const count = await redis.zCard(phoneKey);

    if (count >= limit.count) {
      const oldest = await redis.zRange(phoneKey, 0, 0, { REV: false });
      const retryAfter = oldest.length > 0
        ? Math.ceil((parseInt(oldest[0]) + limit.windowSeconds * 1000 - Date.now()) / 1000)
        : limit.windowSeconds;

      logger.warn({ phoneE164, type, count, limit: limit.count }, "Phone rate limit exceeded");
      return {
        allowed: false,
        reason: `Rate limit exceeded: ${count}/${limit.count} ${type} SMS sent. Try again later.`,
        retryAfter,
      };
    }

    return { allowed: true };
  }

  private static async checkDuplicateMessage(
    phoneE164: string,
    message: string
  ): Promise<{ allowed: boolean; reason?: string; retryAfter?: number }> {
    const redis = await getRedisClient();
    const msgHash = this.hashMessage(message);
    const dupKey = `sms:dup:${phoneE164}:${msgHash}`;

    const exists = await redis.exists(dupKey);
    if (exists) {
      const ttl = await redis.ttl(dupKey);
      logger.warn({ phoneE164, msgHash }, "Duplicate message blocked");
      return {
        allowed: false,
        reason: "Duplicate message. Please wait before resending.",
        retryAfter: ttl > 0 ? ttl : this.LIMITS.cooldown.sameMessage,
      };
    }

    return { allowed: true };
  }

  private static async checkGlobalRateLimit(): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    const redis = await getRedisClient();

    const [hourly, daily, monthly] = await Promise.all([
      redis.get("sms:global:hourly"),
      redis.get("sms:global:daily"),
      redis.get("sms:global:monthly"),
    ]);

    const counts = {
      hourly: parseInt(hourly || "0"),
      daily: parseInt(daily || "0"),
      monthly: parseInt(monthly || "0"),
    };

    if (counts.hourly >= this.LIMITS.global.hourly) {
      logger.error({ counts }, "Global hourly SMS limit exceeded");
      return {
        allowed: false,
        reason: "System SMS limit reached. Please try again later.",
      };
    }

    if (counts.daily >= this.LIMITS.global.daily) {
      logger.error({ counts }, "Global daily SMS limit exceeded");
      return {
        allowed: false,
        reason: "Daily SMS limit reached. Please try again tomorrow.",
      };
    }

    if (counts.monthly >= this.LIMITS.global.monthly) {
      logger.error({ counts }, "Global monthly SMS limit exceeded");
      return {
        allowed: false,
        reason: "Monthly SMS limit reached. Please contact support.",
      };
    }

    return { allowed: true };
  }

  private static async checkCostLimit(): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    const redis = await getRedisClient();

    const [costDaily, costMonthly] = await Promise.all([
      redis.get("sms:cost:daily"),
      redis.get("sms:cost:monthly"),
    ]);

    const costs = {
      daily: parseFloat(costDaily || "0"),
      monthly: parseFloat(costMonthly || "0"),
    };

    if (costs.daily >= this.LIMITS.costs.dailyLimit) {
      logger.error({ costs }, "Daily SMS cost limit exceeded");
      return {
        allowed: false,
        reason: "Daily SMS budget exceeded. Please try again tomorrow.",
      };
    }

    if (costs.monthly >= this.LIMITS.costs.monthlyLimit) {
      logger.error({ costs }, "Monthly SMS cost limit exceeded");
      return {
        allowed: false,
        reason: "Monthly SMS budget exceeded. Please contact support.",
      };
    }

    return { allowed: true };
  }

  private static hashMessage(message: string): string {
    // Simple hash for duplicate detection (first 20 chars + length)
    return `${message.substring(0, 20).replace(/\s/g, "")}-${message.length}`;
  }
}
