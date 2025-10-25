import nodemailer from "nodemailer";
import { logger } from "../utils/logger";

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    email: string;
  };
}

export const emailConfig: EmailConfig = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true" || false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  from: {
    name: process.env.SMTP_FROM_NAME || "Jaddpi App",
    email: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "",
  },
};

// Create nodemailer transporter
export const createEmailTransporter = () => {
  if (!emailConfig.auth.user || !emailConfig.auth.pass) {
    logger.warn("⚠️  Email configuration missing. Emails will be logged to console only.");
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: emailConfig.auth,
  });

  // Verify connection configuration
  transporter.verify((error:any) => {
    if (error) {
      logger.error("❌ Email configuration error:", error);
    } else {
      logger.info("✅ Email server is ready to send messages");
    }
  });

  return transporter;
};

export const emailTransporter = createEmailTransporter();