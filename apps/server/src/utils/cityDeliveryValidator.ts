import { ServiceArea } from "../models/ServiceArea";

/**
 * Simple delivery area validator for city-based restrictions
 */
export class DeliveryAreaValidator {
  
  /**
   * Check if delivery is available to a specific city
   */
  static async isDeliveryAvailable(city: string, postalCode?: string): Promise<{
    available: boolean;
    serviceArea?: any;
    message: string;
  }> {
    try {
      // Normalize city name for comparison
      const normalizedCity = city.trim().toLowerCase();
      
      // Find active service area for the city
      const serviceArea = await ServiceArea.findOne({
        name: { $regex: new RegExp(`^${normalizedCity}$`, 'i') },
        isActive: true
      });

      if (!serviceArea) {
        return {
          available: false,
          message: `Sorry, we don't deliver to ${city} yet. We currently serve limited areas in BC.`
        };
      }

      // If postal code is provided, check if it matches patterns
      if (postalCode && serviceArea.postalCodePatterns.length > 0) {
        const normalizedPostal = postalCode.trim().toUpperCase().substring(0, 3);
        const isPostalMatch = serviceArea.postalCodePatterns.some(pattern => 
          normalizedPostal.startsWith(pattern.toUpperCase())
        );
        
        if (!isPostalMatch) {
          return {
            available: false,
            serviceArea,
            message: `We deliver to ${city} but not to the ${postalCode} postal area yet.`
          };
        }
      }

      return {
        available: true,
        serviceArea,
        message: `Great! We deliver to ${city}.${serviceArea.estimatedDeliveryHours ? ` Estimated delivery: ${serviceArea.estimatedDeliveryHours} hours.` : ''}`
      };

    } catch (error) {
      console.error('Error checking delivery availability:', error);
      return {
        available: false,
        message: 'Unable to check delivery availability. Please try again.'
      };
    }
  }

  /**
   * Get all active delivery areas
   */
  static async getActiveDeliveryAreas(): Promise<any[]> {
    try {
      return await ServiceArea.find(
        { isActive: true }, 
        { name: 1, type: 1, deliveryFee: 1, estimatedDeliveryHours: 1 }
      ).sort({ name: 1 });
    } catch (error) {
      console.error('Error fetching delivery areas:', error);
      return [];
    }
  }

  /**
   * Validate address during order creation
   */
  static async validateAddressForDelivery(address: {
    city: string;
    pincode: string;
  }): Promise<{
    valid: boolean;
    error?: string;
    deliveryFee?: number;
    estimatedHours?: number;
  }> {
    const check = await this.isDeliveryAvailable(address.city, address.pincode);
    
    if (!check.available) {
      return {
        valid: false,
        error: check.message
      };
    }

    return {
      valid: true,
      deliveryFee: check.serviceArea?.deliveryFee,
      estimatedHours: check.serviceArea?.estimatedDeliveryHours
    };
  }
}

/**
 * Helper function to seed initial service areas for testing
 */
export async function seedServiceAreas() {
  const areas = [
    {
      name: "Vancouver",
      type: "city",
      province: "BC",
      country: "CA",
      postalCodePatterns: ["V6B", "V6C", "V6E", "V6G", "V6H", "V6J", "V6K", "V6L", "V6M", "V6N", "V6P", "V6R", "V6S", "V6T", "V6V", "V6W", "V6X", "V6Y", "V6Z"],
      isActive: true,
      deliveryFee: 5.99,
      estimatedDeliveryHours: 2
    },
    {
      name: "Burnaby",
      type: "city", 
      province: "BC",
      country: "CA",
      postalCodePatterns: ["V5A", "V5B", "V5C", "V5E", "V5G", "V5H", "V5J"],
      isActive: true,
      deliveryFee: 7.99,
      estimatedDeliveryHours: 3
    },
    {
      name: "Surrey",
      type: "city",
      province: "BC", 
      country: "CA",
      postalCodePatterns: ["V3R", "V3S", "V3T", "V3V", "V3W", "V3X", "V4A", "V4N", "V4P"],
      isActive: true,
      deliveryFee: 9.99,
      estimatedDeliveryHours: 4
    },
    {
      name: "Richmond",
      type: "city",
      province: "BC",
      country: "CA", 
      postalCodePatterns: ["V6V", "V6W", "V6X", "V6Y", "V7A", "V7B", "V7C", "V7E"],
      isActive: true,
      deliveryFee: 6.99,
      estimatedDeliveryHours: 3
    }
  ];

  for (const area of areas) {
    await ServiceArea.findOneAndUpdate(
      { name: area.name, province: area.province },
      area,
      { upsert: true, new: true }
    );
  }
  
  console.log('Service areas seeded successfully');
}