import { emailTransporter, emailConfig } from "../config/email";
import { TemplateService, OTP_TEMPLATE_VARIABLES } from "./template.service";
import { logger } from "../utils/logger";

export interface SendOtpEmailData {
  email: string;
  code: string;
  type?: "signup" | "login" | "password_reset";
}

export interface SendEmailData {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  templateName?: string;
  templateVariables?: Record<string, any>;
}

export const EmailService = {
  async sendOtpEmail(data: SendOtpEmailData): Promise<void> {
    const { email, code, type = "signup" } = data;

    try {
      const templateName = `otp-${type}`;
      const subject = this.getSubjectByType(type);

      // Get template variables
      const templateVariables = type === "signup"
        ? OTP_TEMPLATE_VARIABLES.signup(code)
        : type === "login"
        ? OTP_TEMPLATE_VARIABLES.login(code)
        : OTP_TEMPLATE_VARIABLES.passwordReset(code);

      await this.sendTemplatedEmail({
        to: email,
        subject,
        templateName,
        templateVariables,
      });

      logger.info(`✅ OTP email sent successfully to ${email}`);
    } catch (error) {

      throw new Error(`Failed to send OTP email: ${error}`);
    }
  },

  async sendTemplatedEmail(data: SendEmailData): Promise<void> {
    const { to, subject, templateName, templateVariables = {} } = data;

    if (!templateName) {
      throw new Error("Template name is required for templated emails");
    }

    try {
      // Render template
      const { html, text } = await TemplateService.renderEmailTemplate(
        templateName,
        templateVariables
      );

      await this.sendEmail({
        to,
        subject,
        html,
        text,
      });
    } catch (error) {

      throw error;
    }
  },

  async sendEmail(data: SendEmailData): Promise<void> {
    const { to, subject, html, text } = data;

    if (!emailTransporter) {
      // Fallback to console logging if no email transporter configured
      logger.warn("⚠️  No email transporter configured. Logging email to console:");
      logger.info(`📧 Email to ${to}:`);
      logger.info(`Subject: ${subject}`);
      if (text) {
        logger.info(`Text content:\n${text}`);
      }
      logger.info(`✅ Email would have been sent to ${to}`);
      return;
    }

    try {
      const mailOptions = {
        from: `${emailConfig.from.name} <${emailConfig.from.email}>`,
        to,
        subject,
        text,
        html,
      };

      const result = await emailTransporter.sendMail(mailOptions);

      logger.info(`✅ Email sent successfully to ${to}. Message ID: ${result.messageId}`);
    } catch (error) {

      throw new Error(`Failed to send email: ${error}`);
    }
  },

  getSubjectByType(type: string): string {
    switch (type) {
      case "signup":
        return "Verify Your Email - Signup OTP";
      case "login":
        return "Your Login Verification Code";
      case "password_reset":
        return "Reset Your Password - Verification Code";
      default:
        return "Your Verification Code";
    }
  },

  // Utility method to test email configuration
  async testEmailConfiguration(): Promise<boolean> {
    if (!emailTransporter) {
      logger.warn("No email transporter configured");
      return false;
    }

    try {
      await emailTransporter.verify();
      logger.info("✅ Email configuration is valid");
      return true;
    } catch (error) {

      return false;
    }
  },

  // Get available email templates
  getAvailableTemplates(): string[] {
    return TemplateService.getAvailableTemplates();
  },
};