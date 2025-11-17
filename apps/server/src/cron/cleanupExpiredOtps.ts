import { OtpService } from "../services/otp.service";
import { logger } from "../utils/logger";

/**
 * Cleanup expired and invalidated OTPs from the database
 * Runs periodically to keep the OTP collection clean
 */
export async function runOtpCleanup(): Promise<void> {
  try {
    logger.info("Starting OTP cleanup job");
    await OtpService.cleanupExpiredOtps();
    logger.info("OTP cleanup job completed successfully");
  } catch (error) {
    logger.error({ error }, "OTP cleanup job failed");
    throw error;
  }
}
