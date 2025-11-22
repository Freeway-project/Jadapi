/**
 * SMS Module - Barrel Export
 * Single entry point for all SMS functionality
 */

// Interfaces
export {
  ISmsProvider,
  SmsType,
  SendSmsOptions as ProviderSendOptions,
  SendSmsResult,
  SmsProviderConfig,
} from "./interfaces/SmsProvider";

// Providers
export { TwilioProvider, getTwilioProvider } from "./providers/TwilioProvider";

// Templates
export { SmsTemplates, TemplateKey } from "./templates";

// Service
export {
  SmsService,
  getSmsService,
  smsService,
  SendSmsOptions,
} from "./SmsService";
