import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: Number(process.env.PORT ?? 3000),
  MONGO_URI: process.env.MONGO_URI ?? "",
  NODE_ENV: process.env.NODE_ENV ?? "development",

  // Email configuration
  SMTP_HOST: process.env.SMTP_HOST ?? "smtp.gmail.com",
  SMTP_PORT: Number(process.env.SMTP_PORT ?? 587),
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  SMTP_USER: process.env.SMTP_USER ?? "",
  SMTP_PASS: process.env.SMTP_PASS ?? "",
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME ?? "Jadapi App",
  SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER ?? "",
};
