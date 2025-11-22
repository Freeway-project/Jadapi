/**
 * SMS Service
 * Main service for sending SMS messages
 * Following Open/Closed Principle (OCP) - extensible for new providers
 * Following Dependency Inversion Principle (DIP) - depends on abstractions
 */

import { ISmsProvider, SmsType, SendSmsResult } from "./interfaces/SmsProvider";
import { getTwilioProvider } from "./providers/TwilioProvider";
import { SmsTemplates } from "./templates";
import { SmsRateLimitService } from "../services/smsRateLimit.service";
import { logger } from "../utils/logger";
import { ApiError } from "../utils/ApiError";

export interface SendSmsOptions {
  phoneE164: string;
  message: string;
  type?: SmsType;
  skipRateLimit?: boolean;
  source?: string;
  metadata?: Record<string, string>;
}

/**
 * SMS Service - Facade for all SMS operations
 * Single point of entry for SMS functionality
 */
export class SmsService {
  private provider: ISmsProvider;

  constructor(provider?: ISmsProvider) {
    // Default to Twilio provider, but allow injection for testing
    this.provider = provider || getTwilioProvider();
  }

  /**
   * Send SMS with rate limiting and error handling
   */
  async send(options: SendSmsOptions): Promise<SendSmsResult> {
    const {
      phoneE164,
      message,
      type = "transactional",
      skipRateLimit = false,
      source = "system",
      metadata = {},
    } = options;

    logger.info({
      phoneE164,
      type,
      messageLength: message.length,
      source,
      provider: this.provider.getProviderName(),
    }, `SmsService: Attempting to send SMS`);

    // Check if provider is configured
    if (!this.provider.isConfigured()) {
      logger.error("SmsService: Provider not configured");
      throw new ApiError(500, "SMS service not configured");
    }

    // Check rate limits (unless emergency bypass)
    if (!skipRateLimit) {
      const rateLimitCheck = await SmsRateLimitService.canSendSms(phoneE164, type, message);

      if (!rateLimitCheck.allowed) {
        logger.warn({
          phoneE164,
          type,
          source,
          reason: rateLimitCheck.reason,
        }, "SmsService: Blocked by rate limit");

        throw new ApiError(429, rateLimitCheck.reason || "SMS rate limit exceeded", {
          retryAfter: rateLimitCheck.retryAfter,
          source,
        });
      }
    }

    // Send SMS via provider
    const result = await this.provider.send({
      to: phoneE164,
      message,
      type,
      metadata,
    });

    if (result.success) {
      // Record successful send for rate limiting
      await SmsRateLimitService.recordSmsSent(phoneE164, type, message);

      logger.info({
        phoneE164,
        type,
        source,
        messageId: result.messageId,
      }, `SmsService: SMS sent successfully`);
    } else {
      // Record failure for cooldown
      await SmsRateLimitService.recordSmsFailure(phoneE164, type);

      logger.error({
        phoneE164,
        type,
        source,
        error: result.error,
      }, `SmsService: Failed to send SMS`);

      throw new ApiError(500, result.error || "Failed to send SMS");
    }

    return result;
  }

  /**
   * Send OTP verification code
   */
  async sendOtp(phoneE164: string, code: string, minutes: number = 5): Promise<SendSmsResult> {
    const message = SmsTemplates.otp(code, minutes);
    return this.send({
      phoneE164,
      message,
      type: "otp",
      source: "otp-verification",
    });
  }

  /**
   * Send order accepted notification to sender
   */
  async sendOrderAcceptedSender(phoneE164: string, orderId: string, driverName: string): Promise<SendSmsResult> {
    const message = SmsTemplates.orderAcceptedSender(orderId, driverName);
    return this.send({
      phoneE164,
      message,
      type: "delivery",
      source: "order-accepted",
      metadata: { orderId, driverName },
    });
  }

  /**
   * Send order accepted notification to receiver
   */
  async sendOrderAcceptedReceiver(phoneE164: string, orderId: string, driverName: string): Promise<SendSmsResult> {
    const message = SmsTemplates.orderAcceptedReceiver(orderId, driverName);
    return this.send({
      phoneE164,
      message,
      type: "delivery",
      source: "order-accepted",
      metadata: { orderId, driverName },
    });
  }

  /**
   * Send package picked up notification to sender
   */
  async sendPackagePickedUpSender(phoneE164: string, orderId: string, driverName: string): Promise<SendSmsResult> {
    const message = SmsTemplates.packagePickedUpSender(orderId, driverName);
    return this.send({
      phoneE164,
      message,
      type: "delivery",
      source: "package-pickup",
      metadata: { orderId, driverName },
    });
  }

  /**
   * Send package picked up notification to receiver
   */
  async sendPackagePickedUpReceiver(phoneE164: string, orderId: string, driverName: string): Promise<SendSmsResult> {
    const message = SmsTemplates.packagePickedUpReceiver(orderId, driverName);
    return this.send({
      phoneE164,
      message,
      type: "delivery",
      source: "package-pickup",
      metadata: { orderId, driverName },
    });
  }

  /**
   * Send package delivered notification to sender
   */
  async sendPackageDeliveredSender(phoneE164: string, orderId: string): Promise<SendSmsResult> {
    const message = SmsTemplates.packageDeliveredSender(orderId);
    return this.send({
      phoneE164,
      message,
      type: "delivery",
      source: "package-delivered",
      metadata: { orderId },
    });
  }

  /**
   * Send package delivered notification to receiver
   */
  async sendPackageDeliveredReceiver(phoneE164: string, orderId: string): Promise<SendSmsResult> {
    const message = SmsTemplates.packageDeliveredReceiver(orderId);
    return this.send({
      phoneE164,
      message,
      type: "delivery",
      source: "package-delivered",
      metadata: { orderId },
    });
  }

  /**
   * Send delivery started notification
   */
  async sendDeliveryStarted(phoneE164: string, orderId: string, driverName: string): Promise<SendSmsResult> {
    const message = SmsTemplates.deliveryStarted(orderId, driverName);
    return this.send({
      phoneE164,
      message,
      type: "delivery",
      source: "delivery-started",
      metadata: { orderId, driverName },
    });
  }

  /**
   * Send booking confirmation
   */
  async sendBookingConfirmation(phoneE164: string, orderId: string, pickupTime: string): Promise<SendSmsResult> {
    const message = SmsTemplates.bookingConfirmed(orderId, pickupTime);
    return this.send({
      phoneE164,
      message,
      type: "booking",
      source: "booking-confirmation",
      metadata: { orderId, pickupTime },
    });
  }

  /**
   * Send delivery attempted notification
   */
  async sendDeliveryAttempted(phoneE164: string, orderId: string, nextAttempt: string): Promise<SendSmsResult> {
    const message = SmsTemplates.deliveryAttempted(orderId, nextAttempt);
    return this.send({
      phoneE164,
      message,
      type: "delivery",
      source: "delivery-attempted",
      metadata: { orderId, nextAttempt },
    });
  }

  /**
   * Send delivery exception notification
   */
  async sendDeliveryException(phoneE164: string, orderId: string, reason: string): Promise<SendSmsResult> {
    const message = SmsTemplates.deliveryException(orderId, reason);
    return this.send({
      phoneE164,
      message,
      type: "delivery",
      source: "delivery-exception",
      metadata: { orderId, reason },
    });
  }

  /**
   * Send custom message
   */
  async sendCustomMessage(
    phoneE164: string,
    message: string,
    type: SmsType = "transactional"
  ): Promise<SendSmsResult> {
    return this.send({
      phoneE164,
      message,
      type,
      source: "custom",
    });
  }
}

// Singleton instance
let smsServiceInstance: SmsService | null = null;

export function getSmsService(): SmsService {
  if (!smsServiceInstance) {
    smsServiceInstance = new SmsService();
  }
  return smsServiceInstance;
}

// Export for direct use
export const smsService = getSmsService();
