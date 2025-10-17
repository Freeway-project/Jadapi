import fs from "fs";
import path from "path";
import { logger } from "../utils/logger";

export interface TemplateVariables {
  [key: string]: string | number | boolean;
}

export interface EmailTemplate {
  html: string;
  text: string;
}

export class TemplateService {
  private static templateCache = new Map<string, string>();
  private static templatesDir = path.join(__dirname, "../templates/emails");

  static async renderTemplate(
    templateName: string,
    variables: TemplateVariables,
    format: "html" | "text" = "html"
  ): Promise<string> {
    try {
      const templatePath = path.join(this.templatesDir, `${templateName}.${format}`);

      // Get template content (with caching)
      let templateContent = this.templateCache.get(templatePath);

      if (!templateContent) {
        if (!fs.existsSync(templatePath)) {
          throw new Error(`Template not found: ${templatePath}`);
        }

        templateContent = fs.readFileSync(templatePath, "utf-8");

        // Cache template in development, skip in production for hot reload
        if (process.env.NODE_ENV !== "development") {
          this.templateCache.set(templatePath, templateContent);
        }
      }

      // Replace variables in template
      return this.replaceVariables(templateContent, variables);
    } catch (error) {
      logger.error(`Failed to render template ${templateName}:`);
      throw new Error(`Template rendering failed: ${error}`);
    }
  }

  static async renderEmailTemplate(
    templateName: string,
    variables: TemplateVariables
  ): Promise<EmailTemplate> {
    const [html, text] = await Promise.all([
      this.renderTemplate(templateName, variables, "html"),
      this.renderTemplate(templateName, variables, "text"),
    ]);

    return { html, text };
  }

  private static replaceVariables(template: string, variables: TemplateVariables): string {
    let result = template;

    // Replace {{variable}} patterns
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
      result = result.replace(regex, String(value));
    }

    // Check for unreplaced variables and warn
    const unreplacedMatches = result.match(/\{\{\s*\w+\s*\}\}/g);
    if (unreplacedMatches) {
      logger.warn(`Unreplaced template variables found: ${unreplacedMatches.join(", ")}`);
    }

    return result;
  }

  static clearCache(): void {
    this.templateCache.clear();
    logger.info("Template cache cleared");
  }

  static getAvailableTemplates(): string[] {
    try {
      const files = fs.readdirSync(this.templatesDir);
      const templates = new Set<string>();

      files.forEach(file => {
        if (file.endsWith(".html") || file.endsWith(".txt")) {
          const templateName = file.replace(/\.(html|txt)$/, "");
          templates.add(templateName);
        }
      });

      return Array.from(templates);
    } catch (error) {
      logger.error("Failed to get available templates:");
      return [];
    }
  }

  static validateTemplate(templateName: string): boolean {
    const htmlPath = path.join(this.templatesDir, `${templateName}.html`);
    const textPath = path.join(this.templatesDir, `${templateName}.txt`);

    return fs.existsSync(htmlPath) && fs.existsSync(textPath);
  }
}

// Pre-defined template variable sets for common use cases
export const OTP_TEMPLATE_VARIABLES = {
  signup: (code: string, appName = "Jadapi App") => ({
    otpCode: code,
    appName,
  }),
  login: (code: string, appName = "Jadapi App") => ({
    otpCode: code,
    appName,
  }),
  passwordReset: (code: string, appName = "Jadapi App") => ({
    otpCode: code,
    appName,
  }),
};