/**
 * SMS Provider Interface
 * Following Interface Segregation Principle (ISP)
 * Defines contract for any SMS provider implementation
 */

export type SmsType = "otp" | "delivery" | "booking" | "promotional" | "transactional";

export interface SendSmsOptions {
  to: string;           // Phone number in E.164 format
  message: string;
  type?: SmsType;
  metadata?: Record<string, string>;
}

export interface SendSmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface SmsProviderConfig {
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
  region?: string;
}

/**
 * Abstract SMS Provider interface
 * Any SMS provider (Twilio, etc.) must implement this
 */
export interface ISmsProvider {
  /**
   * Send an SMS message
   */
  send(options: SendSmsOptions): Promise<SendSmsResult>;

  /**
   * Check if provider is properly configured
   */
  isConfigured(): boolean;

  /**
   * Get provider name for logging
   */
  getProviderName(): string;
}
