/**
 * Twilio SMS Provider Implementation
 * Following Single Responsibility Principle (SRP)
 * Only handles Twilio-specific SMS sending logic
 */

import Twilio from "twilio";
import { ISmsProvider, SendSmsOptions, SendSmsResult } from "../interfaces/SmsProvider";
import { logger } from "../../utils/logger";
import { ENV } from "../../config/env";

export class TwilioProvider implements ISmsProvider {
  private client: Twilio.Twilio | null = null;
  private fromNumber: string;

  constructor() {
    const accountSid = ENV.TWILIO_ACCOUNT_SID;
    const authToken = ENV.TWILIO_AUTH_TOKEN;
    this.fromNumber = ENV.TWILIO_PHONE_NUMBER || "";

    if (accountSid && authToken) {
      this.client = Twilio(accountSid, authToken);
      logger.info("TwilioProvider initialized successfully");
    } else {
      logger.warn("TwilioProvider: Missing credentials - SMS will not be sent");
    }
  }

  getProviderName(): string {
    return "Twilio";
  }

  isConfigured(): boolean {
    return this.client !== null && this.fromNumber !== "";
  }

  async send(options: SendSmsOptions): Promise<SendSmsResult> {
    const { to, message, type = "transactional", metadata = {} } = options;

    if (!this.isConfigured()) {
      logger.error("TwilioProvider: Not configured - cannot send SMS");
      return {
        success: false,
        error: "SMS provider not configured",
      };
    }

    try {
      logger.info({
        to,
        type,
        messageLength: message.length,
        metadata,
      }, `TwilioProvider: Sending ${type} SMS`);

      const result = await this.client!.messages.create({
        body: message,
        from: this.fromNumber,
        to: to,
      });

      logger.info({
        to,
        type,
        messageId: result.sid,
        status: result.status,
      }, `TwilioProvider: SMS sent successfully`);

      return {
        success: true,
        messageId: result.sid,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      logger.error({
        error,
        to,
        type,
        metadata,
      }, `TwilioProvider: Failed to send SMS - ${errorMessage}`);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

// Singleton instance
let twilioProviderInstance: TwilioProvider | null = null;

export function getTwilioProvider(): TwilioProvider {
  if (!twilioProviderInstance) {
    twilioProviderInstance = new TwilioProvider();
  }
  return twilioProviderInstance;
}
