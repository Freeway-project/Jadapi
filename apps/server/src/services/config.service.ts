import fs from 'fs/promises';
import path from 'path';
import { PricingConfig } from '../types/pricing.types';
import defaultConfig from '../config/app.config';
import { logger } from '../utils/logger';

/**
 * Configuration service for loading and managing pricing configuration
 * Supports versioned configurations and runtime reloading
 */
export class ConfigService {
  private static cachedConfig: AppConfig | null = null;
  private static configPath = path.join(__dirname, '../config/app.config.js');

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
      // Use imported default config (works in both dev and production)
      this.cachedConfig = defaultConfig as AppConfig;
      return this.cachedConfig;
    } catch (error) {
      logger.error({ error }, 'Failed to load config');
      throw new Error('Configuration file not found or invalid');
    }
  }

  /**
   * Reload configuration from disk
   * Note: In production with imported config, this will not reload file changes
   * Consider using database or environment variables for dynamic config
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
   * Note: This will write to the compiled .js file
   * For dynamic config updates, consider using database storage
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

    try {
      // Write updated config to file (will update the compiled .js file)
      const configString = `export default ${JSON.stringify(updated, null, 2)};\n`;
      await fs.writeFile(this.configPath, configString, 'utf-8');

      // Reload cache
      await this.reloadConfig();
    } catch (error) {
      logger.error({ error }, 'Failed to update config');
      throw new Error('Failed to write configuration file');
    }
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
