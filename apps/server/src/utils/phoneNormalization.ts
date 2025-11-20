import { ApiError } from "./ApiError";

/**
 * Normalizes phone numbers to E.164 format (+1XXXXXXXXXX)
 * Ensures consistent phone number storage and lookup across the system
 *
 * @param phone - Phone number in any format
 * @returns Normalized phone number in E.164 format or undefined
 * @throws ApiError if phone format is invalid
 */
export function normalizePhone(phone: string | undefined): string | undefined {
  if (!phone) return undefined;

  // Remove all non-digits
  const digitsOnly = phone.replace(/\D/g, '');

  // Validate length (10-15 digits)
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    throw new ApiError(400, 'Phone number must have 10-15 digits');
  }

  // For 10-digit numbers, assume US/Canada and add +1
  if (digitsOnly.length === 10) {
    return `+1${digitsOnly}`;
  }

  // For 11-digit numbers starting with 1, add +
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return `+${digitsOnly}`;
  }

  // For other lengths, add + prefix
  return `+${digitsOnly}`;
}

/**
 * Validates phone number format without throwing errors
 *
 * @param phone - Phone number to validate
 * @returns true if valid, false otherwise
 */
export function isValidPhone(phone: string | undefined): boolean {
  if (!phone) return false;

  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}
