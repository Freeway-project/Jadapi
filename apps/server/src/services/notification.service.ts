/**
 * Example usage of the reusable SMS client for different scenarios
 * This shows how to send OTP and delivery notifications
 */

import { logger } from "../utils/logger";
import { 
  sendSms, 
  sendOtpSms, 
  sendDeliverySms, 
  sendBookingSms,
  SmsHelpers,
  SmsTemplates 
} from "../utils/SmsClient";

export class NotificationService {
  
  /**
   * Send OTP for user verification
   */
  static async sendVerificationOtp(phoneNumber: string, otpCode: string): Promise<void> {

    
    try {
      logger.info({ phoneNumber }, 'NotificationService.sendVerificationOtp - initiating');
      // Option 1: Using the helper function (recommended)
      logger.info(`Sending OTP ${otpCode} to ${phoneNumber}`);
      const phoneE164 = phoneNumber.startsWith("+") ? phoneNumber : `+1${phoneNumber}`;
      await SmsHelpers.sendOtpCode(phoneE164, otpCode, 5);

      // Option 2: Using the direct function
      // await sendOtpSms(phoneNumber, SmsTemplates.otp(otpCode, 5));

      logger.info({ phoneNumber }, `OTP sent successfully to ${phoneNumber}`);
    } catch (error) {
      logger.error({ error, phoneNumber }, `Failed to send OTP to ${phoneNumber}`);
      throw new Error("Failed to send verification code");
    }
  }

  /**
   * Notify customer when delivery starts
   */
  static async notifyDeliveryStarted(
    customerPhone: string, 
    orderId: string, 
    driverName: string
  ): Promise<void> {
    try {
      await SmsHelpers.notifyDeliveryStarted(customerPhone, orderId, driverName);
      logger.info({ orderId, customerPhone }, `Delivery started notification sent for order ${orderId}`);
    } catch (error) {
      logger.error({ error, orderId }, `Failed to send delivery notification for order ${orderId}`);
    }
  }

  /**
   * Notify customer when package is delivered
   */
  static async notifyDeliveryCompleted(
    customerPhone: string, 
    orderId: string
  ): Promise<void> {
    try {
      await SmsHelpers.notifyDeliveryCompleted(customerPhone, orderId);
      logger.info({ orderId, customerPhone }, `Delivery completion notification sent for order ${orderId}`);
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
      await SmsHelpers.confirmBooking(customerPhone, orderId, pickupTime);
      logger.info({ orderId, customerPhone }, `Booking confirmation sent for order ${orderId}`);
    } catch (error) {
      logger.error({ error, orderId }, `Failed to send booking confirmation`);
    }
  }

  /**
   * Send custom message using the generic SMS function
   */
  static async sendCustomMessage(
    phoneNumber: string,
    message: string,
    type: "otp" | "delivery" | "booking" | "promotional" | "transactional" = "transactional"
  ): Promise<void> {
    try {
      await sendSms({
        phoneE164: phoneNumber,
        message,
        type,
        senderId: "Jadapi"
      });
      logger.info({ phoneNumber, type }, `Custom message sent to ${phoneNumber}`);
    } catch (error) {
      logger.error({ error, phoneNumber }, `Failed to send custom message`);
    }
  }

  /**
   * Handle delivery exceptions (failed delivery attempts)
   */
  static async notifyDeliveryException(
    customerPhone: string,
    orderId: string,
    reason: string
  ): Promise<void> {
    try {
      await SmsHelpers.notifyDeliveryException(customerPhone, orderId, reason);
      logger.info({ orderId, customerPhone, reason }, `Delivery exception notification sent for order ${orderId}`);
    } catch (error) {
      logger.error({ error, orderId }, `Failed to send delivery exception notification`);
    }
  }

  /**
   * Send bulk notifications (e.g., service updates)
   */
  static async sendBulkNotification(
    phoneNumbers: string[],
    message: string
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    const promises = phoneNumbers.map(async (phone) => {
      try {
        await sendSms({
          phoneE164: phone,
          message,
          type: "promotional"
        });
        success++;
      } catch (error) {
        logger.error({ error, phone }, `Failed to send to ${phone}`);
        failed++;
      }
    });

    await Promise.allSettled(promises);

    logger.info({ success, failed }, `Bulk SMS completed: ${success} successful, ${failed} failed`);
    return { success, failed };
  }
}

// Example usage:
/*
// Send OTP
await NotificationService.sendVerificationOtp("+16045551234", "123456");

// Notify delivery started
await NotificationService.notifyDeliveryStarted(
  "+16045551234", 
  "ORD-12345", 
  "John Driver"
);

// Confirm booking
await NotificationService.sendBookingConfirmation(
  "+16045551234",
  "ORD-12345", 
  "Today at 2:00 PM"
);

// Custom message
await NotificationService.sendCustomMessage(
  "+16045551234",
  "Your package will arrive between 2-4 PM today",
  "delivery"
);
*/