import AppConfig from '../models/AppConfig';

/**
 * Service for managing app configuration including app active status
 */
export class AppConfigService {
  /**
   * Get the global app configuration
   */
  static async getAppConfig() {
    try {
      let config = await AppConfig.findOne({ id: 'global' });

      // Create default config if it doesn't exist
      if (!config) {
        config = await AppConfig.create({
          id: 'global',
          appActive: false,
          updatedBy: 'system',
          version: 1,
        });
      }

      return config;
    } catch (error) {
      console.error('Error fetching app config:', error);
      throw new Error('Failed to fetch app configuration');
    }
  }

  /**
   * Check if the app is active
   * @returns boolean indicating if app is active
   */
  static async isAppActive(): Promise<boolean> {
    try {
      const config = await this.getAppConfig();
      return config?.appActive ?? false;
    } catch (error) {
      console.error('Error checking app active status:', error);
      // Default to false if there's an error
      return false;
    }
  }

  /**
   * Update app active status
   * @param isActive - New active status
   * @param updatedBy - User ID or email of who updated the status
   */
  static async updateAppActiveStatus(isActive: boolean, updatedBy: string) {
    try {
      const config = await this.getAppConfig();

      config.appActive = isActive;
      config.updatedBy = updatedBy;
      config.updatedAt = new Date();
      config.version += 1;

      await config.save();

      return config;
    } catch (error) {
      console.error('Error updating app active status:', error);
      throw new Error('Failed to update app active status');
    }
  }

  /**
   * Get full configuration including promo codes
   */
  static async getFullConfig() {
    try {
      const config = await this.getAppConfig();

      return {
        id: config.id,
        appActive: config.appActive,
        promo: config.promo,
        updatedAt: config.updatedAt,
        updatedBy: config.updatedBy,
        version: config.version,
      };
    } catch (error) {
      console.error('Error fetching full config:', error);
      throw new Error('Failed to fetch configuration');
    }
  }

  /**
   * Add promo code to active codes
   */
  static async addPromoCode(code: string, updatedBy: string) {
    try {
      const config = await this.getAppConfig();

      // Initialize promo if it doesn't exist
      if (!config.promo) {
        config.promo = { activeCodes: [] };
      }

      if (!config.promo.activeCodes) {
        config.promo.activeCodes = [];
      }

      if (!config.promo.activeCodes.includes(code)) {
        config.promo.activeCodes.push(code);
        config.updatedBy = updatedBy;
        config.updatedAt = new Date();
        config.version += 1;

        await config.save();
      }

      return config;
    } catch (error) {
      console.error('Error adding promo code:', error);
      throw new Error('Failed to add promo code');
    }
  }

  /**
   * Remove promo code from active codes
   */
  static async removePromoCode(code: string, updatedBy: string) {
    try {
      const config = await this.getAppConfig();

      // Initialize promo if it doesn't exist
      if (!config.promo) {
        config.promo = { activeCodes: [] };
      }

      if (!config.promo.activeCodes) {
        config.promo.activeCodes = [];
      }

      config.promo.activeCodes = config.promo.activeCodes.filter(
        (c: string) => c !== code
      );
      config.updatedBy = updatedBy;
      config.updatedAt = new Date();
      config.version += 1;

      await config.save();

      return config;
    } catch (error) {
      console.error('Error removing promo code:', error);
      throw new Error('Failed to remove promo code');
    }
  }
}
