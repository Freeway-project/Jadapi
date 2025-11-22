/**
 * Notification Service
 * High-level notification coordinator
 * Uses the centralized SMS module for all SMS operations
 */

import { logger } from "../utils/logger";
import { smsService } from "../sms";

export class NotificationService {
  /**
   * Send OTP for user verification
   */
  static async sendVerificationOtp(phoneNumber: string, otpCode: string): Promise<void> {
    try {
      logger.info({ phoneNumber }, "NotificationService: Sending verification OTP");

      // Ensure phone is in E.164 format
      const phoneE164 = phoneNumber.startsWith("+") ? phoneNumber : `+1${phoneNumber}`;

      await smsService.sendOtp(phoneE164, otpCode, 5);

      logger.info({ phoneNumber }, "NotificationService: OTP sent successfully");
    } catch (error) {
      logger.error({ error, phoneNumber }, "NotificationService: Failed to send OTP");
      throw error;
    }
  }

  /**
   * Notify when order is accepted - to sender
   */
  static async notifyOrderAcceptedSender(
    phoneNumber: string,
    orderId: string,
    driverName: string
  ): Promise<void> {
    try {
      await smsService.sendOrderAcceptedSender(phoneNumber, orderId, driverName);
      logger.info({ orderId, phoneNumber }, `Order accepted notification sent to sender`);
    } catch (error) {
      logger.error({ error, orderId }, `Failed to send order accepted notification to sender`);
    }
  }

  /**
   * Notify when order is accepted - to receiver
   */
  static async notifyOrderAcceptedReceiver(
    phoneNumber: string,
    orderId: string,
    driverName: string
  ): Promise<void> {
    try {
      await smsService.sendOrderAcceptedReceiver(phoneNumber, orderId, driverName);
      logger.info({ orderId, phoneNumber }, `Order accepted notification sent to receiver`);
    } catch (error) {
      logger.error({ error, orderId }, `Failed to send order accepted notification to receiver`);
    }
  }

  /**
   * Notify when package is picked up - to sender
   */
  static async notifyPackagePickedUpSender(
    phoneNumber: string,
    orderId: string,
    driverName: string
  ): Promise<void> {
    try {
      await smsService.sendPackagePickedUpSender(phoneNumber, orderId, driverName);
      logger.info({ orderId, phoneNumber }, `Package pickup notification sent to sender`);
    } catch (error) {
      logger.error({ error, orderId }, `Failed to send pickup notification to sender`);
    }
  }

  /**
   * Notify when package is picked up - to receiver
   */
  static async notifyPackagePickedUpReceiver(
    phoneNumber: string,
    orderId: string,
    driverName: string
  ): Promise<void> {
    try {
      await smsService.sendPackagePickedUpReceiver(phoneNumber, orderId, driverName);
      logger.info({ orderId, phoneNumber }, `Package pickup notification sent to receiver`);
    } catch (error) {
      logger.error({ error, orderId }, `Failed to send pickup notification to receiver`);
    }
  }

  /**
   * Notify when package is delivered - to sender
   */
  static async notifyPackageDeliveredSender(
    phoneNumber: string,
    orderId: string
  ): Promise<void> {
    try {
      await smsService.sendPackageDeliveredSender(phoneNumber, orderId);
      logger.info({ orderId, phoneNumber }, `Delivery notification sent to sender`);
    } catch (error) {
      logger.error({ error, orderId }, `Failed to send delivery notification to sender`);
    }
  }

  /**
   * Notify when package is delivered - to receiver
   */
  static async notifyPackageDeliveredReceiver(
    phoneNumber: string,
    orderId: string
  ): Promise<void> {
    try {
      await smsService.sendPackageDeliveredReceiver(phoneNumber, orderId);
      logger.info({ orderId, phoneNumber }, `Delivery notification sent to receiver`);
    } catch (error) {
      logger.error({ error, orderId }, `Failed to send delivery notification to receiver`);
    }
  }

  /**
   * Notify customer when delivery starts (legacy support)
   */
  static async notifyDeliveryStarted(
    customerPhone: string,
    orderId: string,
    driverName: string
  ): Promise<void> {
    try {
      await smsService.sendDeliveryStarted(customerPhone, orderId, driverName);
      logger.info({ orderId, customerPhone }, `Delivery started notification sent`);
    } catch (error) {
      logger.error({ error, orderId }, `Failed to send delivery started notification`);
    }
  }

  /**
   * Notify customer when package is delivered (legacy support)
   */
  static async notifyDeliveryCompleted(
    customerPhone: string,
    orderId: string
  ): Promise<void> {
    try {
      await smsService.sendPackageDeliveredReceiver(customerPhone, orderId);
      logger.info({ orderId, customerPhone }, `Delivery completion notification sent`);
    } catch (error) {
      logger.error({ error, orderId }, `Failed to send delivery completion notification`);
    }
  }

  /**
   * Send booking confirmation
   */
  static async sendBookingConfirmation(
    customerPhone: string,
    orderId: string,
    pickupTime: string
  ): Promise<void> {
    try {
      await smsService.sendBookingConfirmation(customerPhone, orderId, pickupTime);
      logger.info({ orderId, customerPhone }, `Booking confirmation sent`);
    } catch (error) {
      logger.error({ error, orderId }, `Failed to send booking confirmation`);
    }
  }

  /**
   * Send custom message
   */
  static async sendCustomMessage(
    phoneNumber: string,
    message: string,
    type: "otp" | "delivery" | "booking" | "promotional" | "transactional" = "transactional"
  ): Promise<void> {
    try {
      await smsService.sendCustomMessage(phoneNumber, message, type);
      logger.info({ phoneNumber, type }, `Custom message sent`);
    } catch (error) {
      logger.error({ error, phoneNumber }, `Failed to send custom message`);
    }
  }

  /**
   * Handle delivery exceptions
   */
  static async notifyDeliveryException(
    customerPhone: string,
    orderId: string,
    reason: string
  ): Promise<void> {
    try {
      await smsService.sendDeliveryException(customerPhone, orderId, reason);
      logger.info({ orderId, customerPhone, reason }, `Delivery exception notification sent`);
    } catch (error) {
      logger.error({ error, orderId }, `Failed to send delivery exception notification`);
    }
  }

  /**
   * Send bulk notifications
   */
  static async sendBulkNotification(
    phoneNumbers: string[],
    message: string
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    const promises = phoneNumbers.map(async (phone) => {
      try {
        await smsService.sendCustomMessage(phone, message, "promotional");
        success++;
      } catch (error) {
        logger.error({ error, phone }, `Failed to send bulk notification`);
        failed++;
      }
    });

    await Promise.allSettled(promises);

    logger.info({ success, failed }, `Bulk notification completed`);
    return { success, failed };
  }
}
