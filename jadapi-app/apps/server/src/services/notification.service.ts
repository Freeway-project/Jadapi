/**
 * Example usage of the reusable SMS client for different scenarios
 * This shows how to send OTP and delivery notifications
 */

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
      // Option 1: Using the helper function (recommended)
      await SmsHelpers.sendOtpCode(phoneNumber, otpCode, 5);
      
      // Option 2: Using the direct function
      // await sendOtpSms(phoneNumber, SmsTemplates.otp(otpCode, 5));
      
      console.log(`OTP sent successfully to ${phoneNumber}`);
    } catch (error) {
      console.error(`Failed to send OTP to ${phoneNumber}:`, error);
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
      console.log(`Delivery started notification sent for order ${orderId}`);
    } catch (error) {
      console.error(`Failed to send delivery notification for order ${orderId}:`, error);
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
      console.log(`Delivery completion notification sent for order ${orderId}`);
    } catch (error) {
      console.error(`Failed to send delivery completion notification:`, error);
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
      console.log(`Booking confirmation sent for order ${orderId}`);
    } catch (error) {
      console.error(`Failed to send booking confirmation:`, error);
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
      console.log(`Custom message sent to ${phoneNumber}`);
    } catch (error) {
      console.error(`Failed to send custom message:`, error);
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
      console.log(`Delivery exception notification sent for order ${orderId}`);
    } catch (error) {
      console.error(`Failed to send delivery exception notification:`, error);
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
        console.error(`Failed to send to ${phone}:`, error);
        failed++;
      }
    });

    await Promise.allSettled(promises);
    
    console.log(`Bulk SMS completed: ${success} successful, ${failed} failed`);
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