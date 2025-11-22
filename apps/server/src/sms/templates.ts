/**
 * SMS Templates
 * Centralized location for all SMS message templates
 * Following Single Responsibility Principle (SRP)
 */

import { ENV } from "../config/env";

// Helper to get tracking URL
const getTrackingUrl = (orderId: string): string => {
  const baseUrl = ENV.FRONTEND_URL.replace(/\/$/, "");
  return `${baseUrl}/track/${orderId}`;
};

/**
 * SMS message templates for different use cases
 */
export const SmsTemplates = {
  // OTP Verification
  otp: (code: string, minutes: number = 5) =>
    `Your Jaddpi verification code is ${code}. It expires in ${minutes} minutes. Don't share this code with anyone.`,

  // Order Accepted - To Sender (Pickup Contact)
  orderAcceptedSender: (orderId: string, driverName: string) =>
    `Your order #${orderId} has been accepted by ${driverName}. Package will be picked up soon. Track: ${getTrackingUrl(orderId)}`,

  // Order Accepted - To Receiver (Dropoff Contact)
  orderAcceptedReceiver: (orderId: string, driverName: string) =>
    `A package is on its way to you! Order #${orderId} accepted by ${driverName}. Track: ${getTrackingUrl(orderId)}`,

  // Package Picked Up - To Sender
  packagePickedUpSender: (orderId: string, driverName: string) =>
    `Package #${orderId} picked up by ${driverName}. Now in transit. Track: ${getTrackingUrl(orderId)}`,

  // Package Picked Up - To Receiver
  packagePickedUpReceiver: (orderId: string, driverName: string) =>
    `Your package #${orderId} has been picked up by ${driverName} and is on its way. Track: ${getTrackingUrl(orderId)}`,

  // Package Delivered - To Sender
  packageDeliveredSender: (orderId: string) =>
    `Package #${orderId} successfully delivered! Thank you for using Jaddpi.`,

  // Package Delivered - To Receiver
  packageDeliveredReceiver: (orderId: string) =>
    `Your package #${orderId} has been delivered! Thank you for using Jaddpi.`,

  // Delivery Started
  deliveryStarted: (orderId: string, driverName: string) =>
    `Your package #${orderId} is out for delivery with ${driverName}. Track: ${getTrackingUrl(orderId)}`,

  // Booking Confirmed
  bookingConfirmed: (orderId: string, pickupTime: string) =>
    `Booking confirmed! Order #${orderId} will be picked up at ${pickupTime}. Track: ${getTrackingUrl(orderId)}`,

  // Delivery Attempted
  deliveryAttempted: (orderId: string, nextAttempt: string) =>
    `Delivery attempt failed for #${orderId}. Next attempt: ${nextAttempt}. Contact us if needed.`,

  // Delivery Exception
  deliveryException: (orderId: string, reason: string) =>
    `Delivery issue for #${orderId}: ${reason}. Please contact support for assistance.`,
};

export type TemplateKey = keyof typeof SmsTemplates;
