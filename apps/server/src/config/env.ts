import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: Number(process.env.PORT ??4000),
  MONGO_URI: process.env.MONGO_URI ?? "",
  NODE_ENV: process.env.NODE_ENV ?? "development",

  // Email configuration
  SMTP_HOST: process.env.SMTP_HOST ?? "smtp.gmail.com",
  SMTP_PORT: Number(process.env.SMTP_PORT ?? 587),
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  SMTP_USER: process.env.SMTP_USER ?? "",
  SMTP_PASS: process.env.SMTP_PASS ?? "",
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME ?? "Jaddpi App",
  SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER ?? "",
  ADMIN_NOTIFICATION_EMAIL: process.env.ADMIN_NOTIFICATION_EMAIL ?? "canadaharsh2002@gmail.com",

  // Cloudinary configuration
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ?? "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ?? "",

  // Google Maps configuration
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY ?? "",
  JWT_SECRET: process.env.JWT_SECRET,

  // Stripe configuration
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? "",
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY ?? "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? "",

  // Redis configuration
  REDIS_URL: process.env.REDIS_URL ?? "redis://localhost:6379",

  // Frontend URL for tracking links, emails, etc.
  FRONTEND_URL: process.env.FRONTEND_URL  ?? "http://localhost:3000",

  // Twilio SMS configuration
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ?? "",
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ?? "",
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER ?? "",
};
