import fs from 'fs/promises';
import path from 'path';
import { PricingConfig } from '../types/pricing.types';

/**
 * Configuration service for loading and managing pricing configuration
 * Supports versioned configurations and runtime reloading
 */
export class ConfigService {
  private static cachedConfig: AppConfig | null = null;
  private static configPath = path.join(__dirname, '../config/app.config.ts');

  /**
   * Get the active pricing configuration
   */
  static async getActiveConfig(): Promise<AppConfig> {
    if (this.cachedConfig) {
      return this.cachedConfig;
    }

    return this.loadConfig();
  }

  /**
   * Load configuration from file
   */
  static async loadConfig(): Promise<AppConfig> {
    try {
      // Read the config file
      const configContent = await fs.readFile(this.configPath, 'utf-8');

      // Parse the TypeScript object (simplified - in production use proper TS parser)
      const config = this.parseConfigFile(configContent);

      this.cachedConfig = config;
      return config;
    } catch (error) {
      console.error('Failed to load config:', error);
      throw new Error('Configuration file not found or invalid');
    }
  }

  /**
   * Parse configuration file content
   * In production, consider using a proper TypeScript parser or convert to JSON
   */
  private static parseConfigFile(content: string): AppConfig {
    // Remove TypeScript syntax and parse as JSON
    // This is a simplified implementation - consider using ts-node or converting to JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid config file format');
    }

    // Use Function constructor to safely evaluate the object literal
    // In production, prefer storing config as JSON or use a proper parser
    const configObj = eval(`(${jsonMatch[0]})`);

    return configObj as AppConfig;
  }

  /**
   * Reload configuration from disk
   */
  static async reloadConfig(): Promise<AppConfig> {
    this.cachedConfig = null;
    return this.loadConfig();
  }

  /**
   * Get specific pricing parameter
   */
  static async getRateCard() {
    const config = await this.getActiveConfig();
    return config.payload.rateCard;
  }

  /**
   * Get service area configuration
   */
  static async getServiceArea() {
    const config = await this.getActiveConfig();
    return config.payload.serviceArea;
  }

  /**
   * Get distance bands
   */
  static async getDistanceBands() {
    const config = await this.getActiveConfig();
    return config.payload.bands;
  }

  /**
   * Update configuration (write to file)
   * In production, consider database storage for versioning
   */
  static async updateConfig(newConfig: Partial<PricingConfig>): Promise<void> {
    const current = await this.getActiveConfig();

    const updated = {
      ...current,
      payload: {
        ...current.payload,
        ...newConfig
      },
      version: current.version + 1,
      created_at: new Date().toISOString()
    };

    // Write updated config to file
    const configString = `export default ${JSON.stringify(updated, null, 2)};\n`;
    await fs.writeFile(this.configPath, configString, 'utf-8');

    // Reload cache
    await this.reloadConfig();
  }

  /**
   * Validate configuration integrity
   */
  static async validateConfig(): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const config = await this.getActiveConfig();
      const errors: string[] = [];

      // Check required fields
      if (!config.payload.rateCard) {
        errors.push('Missing rate card configuration');
      }
      if (!config.payload.serviceArea) {
        errors.push('Missing service area configuration');
      }
      if (!config.payload.bands || config.payload.bands.length === 0) {
        errors.push('Missing distance bands configuration');
      }

      // Validate service centers
      if (config.payload.serviceArea.centers.length === 0) {
        errors.push('At least one service center is required');
      }

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      return {
        valid: false,
        errors: [(error as Error).message]
      };
    }
  }
}

/**
 * App configuration interface
 */
export interface AppConfig {
  id: string;
  version: number;
  status: 'active' | 'inactive' | 'draft';
  effective_from: string;
  checksum: string;
  payload: PricingConfig;
  created_at: string;
  created_by: string;
}
