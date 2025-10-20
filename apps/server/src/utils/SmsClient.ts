import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { logger } from "./logger";
import { SmsRateLimitService } from "../services/smsRateLimit.service";
import { ApiError } from "./ApiError";

const sns = new SNSClient({ region: "ca-central-1" });

export type SmsType = "otp" | "delivery" | "booking" | "promotional" | "transactional";

interface SmsOptions {
  phoneE164: string;
  message: string;
  type?: SmsType;
  senderId?: string;
  skipRateLimit?: boolean; // Emergency bypass (use with caution)
}

/**
 * Generic SMS sender for all types of messages with rate limiting and cost control
 */
export async function sendSms(options: SmsOptions): Promise<void> {
  const { phoneE164, message, type = "transactional", senderId = "jadapi", skipRateLimit = false } = options;

  logger.info({ phoneE164, type, messageLength: message.length }, `Attempting to send SMS`);

  // Check rate limits (unless emergency bypass)
  if (!skipRateLimit) {
    const rateLimitCheck = await SmsRateLimitService.canSendSms(phoneE164, type, message);

    if (!rateLimitCheck.allowed) {
      logger.warn({ phoneE164, type, reason: rateLimitCheck.reason }, "SMS blocked by rate limit");
      throw new ApiError(429, rateLimitCheck.reason || "SMS rate limit exceeded", {
        retryAfter: rateLimitCheck.retryAfter,
      });
    }
  }

  // Determine SMS type for AWS SNS
  const smsType = type === "promotional" ? "Promotional" : "Transactional";

  const cmd = new PublishCommand({
    PhoneNumber: phoneE164,
    Message: message,
    MessageAttributes: {
      "AWS.SNS.SMS.SMSType": { DataType: "String", StringValue: smsType },
      "AWS.SNS.SMS.SenderID": { DataType: "String", StringValue: senderId },
    }
  });

  try {
    await sns.send(cmd);
    logger.info({ phoneE164, type }, `SMS sent successfully to ${phoneE164} (type: ${type})`);

    // Record successful send for rate limiting
    await SmsRateLimitService.recordSmsSent(phoneE164, type, message);
  } catch (error) {
    logger.error({ error, phoneE164, type }, `Failed to send SMS to ${phoneE164}`);

    // Record failure for cooldown
    await SmsRateLimitService.recordSmsFailure(phoneE164, type);

    throw error;
  }
}

/**
 * Send OTP SMS (backward compatibility)
 */
export async function sendOtpSms(phoneE164: string, msg: string): Promise<void> {
  return sendSms({
    phoneE164,
    message: msg,
    type: "otp"
  });
}

/**
 * Send delivery notification SMS
 */
export async function sendDeliverySms(phoneE164: string, message: string): Promise<void> {
  return sendSms({
    phoneE164,
    message,
    type: "delivery"
  });
}

/**
 * Send booking confirmation SMS
 */
export async function sendBookingSms(phoneE164: string, message: string): Promise<void> {
  return sendSms({
    phoneE164,
    message,
    type: "booking"
  });
}

/**
 * SMS message templates for different use cases
 */
export const SmsTemplates = {
  otp: (code: string, minutes: number = 5) => 
    `Your Jadapi verification code is ${code}. It expires in ${minutes} minutes. Don't share this code with anyone.`,
  
  deliveryStarted: (orderId: string, driverName: string) => 
    `📦 Your package #${orderId} is out for delivery with ${driverName}. Track your delivery at jadapi.com/track/${orderId}`,
  
  deliveryCompleted: (orderId: string) => 
    `✅ Your package #${orderId} has been successfully delivered! Thank you for using Jadapi.`,
  
  bookingConfirmed: (orderId: string, pickupTime: string) => 
    `📋 Booking confirmed! Order #${orderId} will be picked up at ${pickupTime}. Track at jadapi.com/track/${orderId}`,
  
  deliveryAttempted: (orderId: string, nextAttempt: string) => 
    `❗ Delivery attempt failed for #${orderId}. Next attempt: ${nextAttempt}. Contact us if needed.`,
  
  deliveryException: (orderId: string, reason: string) => 
    `⚠️ Delivery issue for #${orderId}: ${reason}. Please contact support for assistance.`
};

/**
 * Helper functions for common SMS scenarios
 */
export const SmsHelpers = {
  sendOtpCode: async (phoneE164: string, code: string, minutes: number = 5) => {
    const message = SmsTemplates.otp(code, minutes);
    return sendSms({ phoneE164, message, type: "otp" });
  },
  
  notifyDeliveryStarted: async (phoneE164: string, orderId: string, driverName: string) => {
    const message = SmsTemplates.deliveryStarted(orderId, driverName);
    return sendSms({ phoneE164, message, type: "delivery" });
  },
  
  notifyDeliveryCompleted: async (phoneE164: string, orderId: string) => {
    const message = SmsTemplates.deliveryCompleted(orderId);
    return sendSms({ phoneE164, message, type: "delivery" });
  },
  
  confirmBooking: async (phoneE164: string, orderId: string, pickupTime: string) => {
    const message = SmsTemplates.bookingConfirmed(orderId, pickupTime);
    return sendSms({ phoneE164, message, type: "booking" });
  },
  
  notifyDeliveryAttempted: async (phoneE164: string, orderId: string, nextAttempt: string) => {
    const message = SmsTemplates.deliveryAttempted(orderId, nextAttempt);
    return sendSms({ phoneE164, message, type: "delivery" });
  },
  
  notifyDeliveryException: async (phoneE164: string, orderId: string, reason: string) => {
    const message = SmsTemplates.deliveryException(orderId, reason);
    return sendSms({ phoneE164, message, type: "delivery" });
  }
};