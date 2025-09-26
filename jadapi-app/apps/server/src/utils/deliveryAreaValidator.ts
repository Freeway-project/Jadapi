import { ServiceArea, ServiceAreaDoc } from "../models/ServiceArea";

export interface ValidationResult {
  isValid: boolean;
  serviceArea?: ServiceAreaDoc;
  reasons: string[];
  availableServices?: {
    delivery: boolean;
    pickup: boolean;
    sameDay: boolean;
    nextDay: boolean;
    express: boolean;
  };
}

export class DeliveryAreaValidator {
  
  /**
   * Check if coordinates are within any active service area
   */
  static async validateCoordinates(lat: number, lng: number): Promise<ValidationResult> {
    const reasons: string[] = [];
    
    try {
      // Find service areas that contain this point
      const serviceAreas = await ServiceArea.find({
        status: "active",
        $or: [
          // Check polygon boundaries using MongoDB's geospatial query
          {
            "boundaries.type": "polygon",
            "boundaries.polygon": {
              $geoIntersects: {
                $geometry: {
                  type: "Point",
                  coordinates: [lng, lat] // GeoJSON uses [lng, lat] order
                }
              }
            }
          },
          // Check radius boundaries
          {
            "boundaries.type": "radius",
            "boundaries.radius.center": {
              $near: {
                $geometry: { type: "Point", coordinates: [lng, lat] },
                $maxDistance: { $multiply: ["$boundaries.radius.radiusKm", 1000] } // Convert km to meters
              }
            }
          }
        ]
      }).sort({ priority: -1 });

      if (serviceAreas.length === 0) {
        reasons.push("Location is outside our current delivery areas");
        return { isValid: false, reasons };
      }

      // Use highest priority service area
      const serviceArea = serviceAreas[0];
      
      return {
        isValid: true,
        serviceArea,
        reasons: [`Delivery available in ${serviceArea.name}`],
        availableServices: {
          delivery: serviceArea.serviceConfig.deliveryEnabled,
          pickup: serviceArea.serviceConfig.pickupEnabled,
          sameDay: serviceArea.serviceConfig.sameDay,
          nextDay: serviceArea.serviceConfig.nextDay,
          express: serviceArea.serviceConfig.expressDelivery
        }
      };
      
    } catch (error) {
      reasons.push(`Error validating coordinates: ${error}`);
      return { isValid: false, reasons };
    }
  }

  /**
   * Check if postal code is within any active service area
   */
  static async validatePostalCode(postalCode: string): Promise<ValidationResult> {
    const reasons: string[] = [];
    const normalizedCode = postalCode.toUpperCase().replace(/\s+/g, '').substring(0, 3);
    
    try {
      // Find service areas that include this postal code
      const serviceAreas = await ServiceArea.find({
        status: "active",
        "boundaries.type": "postal_codes",
        "boundaries.postalCodes": { 
          $in: [normalizedCode, postalCode.toUpperCase()] 
        }
      }).sort({ priority: -1 });

      if (serviceAreas.length === 0) {
        reasons.push(`Postal code ${postalCode} is not in our current service areas`);
        return { isValid: false, reasons };
      }

      const serviceArea = serviceAreas[0];
      
      return {
        isValid: true,
        serviceArea,
        reasons: [`Delivery available for ${postalCode} in ${serviceArea.name}`],
        availableServices: {
          delivery: serviceArea.serviceConfig.deliveryEnabled,
          pickup: serviceArea.serviceConfig.pickupEnabled,
          sameDay: serviceArea.serviceConfig.sameDay,
          nextDay: serviceArea.serviceConfig.nextDay,
          express: serviceArea.serviceConfig.expressDelivery
        }
      };
      
    } catch (error) {
      reasons.push(`Error validating postal code: ${error}`);
      return { isValid: false, reasons };
    }
  }

  /**
   * Comprehensive address validation using both coordinates and postal code
   */
  static async validateAddress(
    lat?: number, 
    lng?: number, 
    postalCode?: string
  ): Promise<ValidationResult> {
    const reasons: string[] = [];
    
    // Try coordinate validation first (most accurate)
    if (lat && lng) {
      const coordResult = await this.validateCoordinates(lat, lng);
      if (coordResult.isValid) {
        return coordResult;
      }
      reasons.push(...coordResult.reasons);
    }

    // Fallback to postal code validation
    if (postalCode) {
      const postalResult = await this.validatePostalCode(postalCode);
      if (postalResult.isValid) {
        return postalResult;
      }
      reasons.push(...postalResult.reasons);
    }

    // No valid location method provided
    if (!lat && !lng && !postalCode) {
      reasons.push("Please provide coordinates or postal code for validation");
    }

    return { isValid: false, reasons };
  }

  /**
   * Get all active service areas with their boundaries
   */
  static async getActiveServiceAreas(): Promise<ServiceAreaDoc[]> {
    return ServiceArea.find({ status: "active" }).sort({ priority: -1, name: 1 });
  }

  /**
   * Check if delivery service is available at specific time
   */
  static isServiceAvailableAtTime(
    serviceArea: ServiceAreaDoc, 
    targetTime: Date = new Date()
  ): { available: boolean; reason?: string } {
    
    const dayName = targetTime.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const timeString = targetTime.toTimeString().substring(0, 5); // "HH:MM"
    
    const daySchedule = serviceArea.operatingHours?.get(dayName);
    
    if (!daySchedule || !daySchedule.enabled) {
      return { 
        available: false, 
        reason: `Service not available on ${dayName}s in ${serviceArea.name}` 
      };
    }
    
    if (timeString < daySchedule.start || timeString > daySchedule.end) {
      return { 
        available: false, 
        reason: `Service hours: ${daySchedule.start} - ${daySchedule.end}` 
      };
    }
    
    return { available: true };
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private static calculateDistance(
    lat1: number, lng1: number, 
    lat2: number, lng2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

// Convenience functions for quick validation
export const isDeliveryAvailable = async (
  lat?: number, 
  lng?: number, 
  postalCode?: string
): Promise<boolean> => {
  const result = await DeliveryAreaValidator.validateAddress(lat, lng, postalCode);
  return result.isValid;
};

export const getServiceAreaForLocation = async (
  lat?: number, 
  lng?: number, 
  postalCode?: string
): Promise<ServiceAreaDoc | null> => {
  const result = await DeliveryAreaValidator.validateAddress(lat, lng, postalCode);
  return result.serviceArea || null;
};