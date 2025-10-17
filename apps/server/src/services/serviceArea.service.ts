import { ServiceArea, ServiceAreaDoc } from "../models/ServiceArea";
import { DeliveryAreaValidator } from "../utils/deliveryAreaValidator";

export class ServiceAreaService {
  
  /**
   * Create a new service area with postal codes (simple setup)
   */
  static async createPostalCodeArea(data: {
    name: string;
    description?: string;
    postalCodes: string[];
    serviceConfig?: Partial<ServiceAreaDoc['serviceConfig']>;
    priority?: number;
  }): Promise<ServiceAreaDoc> {
    
    // Normalize postal codes to first 3 characters
    const normalizedCodes = data.postalCodes.map(code => 
      code.toUpperCase().replace(/\s+/g, '').substring(0, 3)
    );
    
    const serviceArea = new ServiceArea({
      name: data.name,
      description: data.description,
      boundaries: {
        type: "postal_codes",
        postalCodes: normalizedCodes
      },
      serviceConfig: {
        deliveryEnabled: true,
        pickupEnabled: true,
        sameDay: false,
        nextDay: true,
        standardDelivery: true,
        expressDelivery: false,
        ...data.serviceConfig
      },
      priority: data.priority || 0
    });
    
    return await serviceArea.save();
  }
  
  /**
   * Create a radius-based service area (center point + radius)
   */
  static async createRadiusArea(data: {
    name: string;
    description?: string;
    centerLat: number;
    centerLng: number;
    radiusKm: number;
    serviceConfig?: Partial<ServiceAreaDoc['serviceConfig']>;
    priority?: number;
  }): Promise<ServiceAreaDoc> {
    
    const serviceArea = new ServiceArea({
      name: data.name,
      description: data.description,
      boundaries: {
        type: "radius",
        radius: {
          center: { lat: data.centerLat, lng: data.centerLng },
          radiusKm: data.radiusKm
        }
      },
      serviceConfig: {
        deliveryEnabled: true,
        pickupEnabled: true,
        sameDay: false,
        nextDay: true,
        standardDelivery: true,
        expressDelivery: false,
        ...data.serviceConfig
      },
      priority: data.priority || 0
    });
    
    return await serviceArea.save();
  }
  
  /**
   * Create polygon-based service area (most flexible)
   */
  static async createPolygonArea(data: {
    name: string;
    description?: string;
    coordinates: number[][][]; // GeoJSON polygon coordinates
    serviceConfig?: Partial<ServiceAreaDoc['serviceConfig']>;
    priority?: number;
  }): Promise<ServiceAreaDoc> {
    
    const serviceArea = new ServiceArea({
      name: data.name,
      description: data.description,
      boundaries: {
        type: "polygon",
        polygon: {
          type: "Polygon",
          coordinates: data.coordinates
        }
      },
      serviceConfig: {
        deliveryEnabled: true,
        pickupEnabled: true,
        sameDay: false,
        nextDay: true,
        standardDelivery: true,
        expressDelivery: false,
        ...data.serviceConfig
      },
      priority: data.priority || 0
    });
    
    return await serviceArea.save();
  }
  
  /**
   * Get all active service areas
   */
  static async getActiveAreas(): Promise<ServiceAreaDoc[]> {
    return ServiceArea.find({ status: "active" }).sort({ priority: -1, name: 1 });
  }
  
  /**
   * Update service area status
   */
  static async updateAreaStatus(
    areaId: string, 
    status: "active" | "inactive" | "planned"
  ): Promise<ServiceAreaDoc | null> {
    return ServiceArea.findByIdAndUpdate(
      areaId, 
      { status }, 
      { new: true }
    );
  }
  
  /**
   * Add postal codes to existing area
   */
  static async addPostalCodesToArea(
    areaId: string, 
    newPostalCodes: string[]
  ): Promise<ServiceAreaDoc | null> {
    const normalizedCodes = newPostalCodes.map(code => 
      code.toUpperCase().replace(/\s+/g, '').substring(0, 3)
    );
    
    return ServiceArea.findByIdAndUpdate(
      areaId,
      { $addToSet: { "boundaries.postalCodes": { $each: normalizedCodes } } },
      { new: true }
    );
  }
  
  /**
   * Remove postal codes from existing area
   */
  static async removePostalCodesFromArea(
    areaId: string, 
    postalCodesToRemove: string[]
  ): Promise<ServiceAreaDoc | null> {
    const normalizedCodes = postalCodesToRemove.map(code => 
      code.toUpperCase().replace(/\s+/g, '').substring(0, 3)
    );
    
    return ServiceArea.findByIdAndUpdate(
      areaId,
      { $pullAll: { "boundaries.postalCodes": normalizedCodes } },
      { new: true }
    );
  }
  
  /**
   * Update service configuration for an area
   */
  static async updateServiceConfig(
    areaId: string,
    serviceConfig: Partial<ServiceAreaDoc['serviceConfig']>
  ): Promise<ServiceAreaDoc | null> {
    return ServiceArea.findByIdAndUpdate(
      areaId,
      { $set: { serviceConfig } },
      { new: true }
    );
  }
  
  /**
   * Validate if a location can be served
   */
  static async validateLocationForBooking(
    lat?: number,
    lng?: number,
    postalCode?: string
  ): Promise<{
    canServe: boolean;
    serviceArea?: ServiceAreaDoc;
    availableServices: string[];
    message: string;
  }> {
    
    const validation = await DeliveryAreaValidator.validateAddress(lat, lng, postalCode);
    
    return {
      canServe: validation.isValid,
      serviceArea: validation.serviceArea,
      availableServices: validation.availableServices ? 
        Object.entries(validation.availableServices)
          .filter(([_, enabled]) => enabled)
          .map(([service, _]) => service) : [],
      message: validation.reasons.join('. ')
    };
  }
  
  /**
   * Get service areas that serve a specific postal code
   */
  static async getAreasForPostalCode(postalCode: string): Promise<ServiceAreaDoc[]> {
    const normalizedCode = postalCode.toUpperCase().replace(/\s+/g, '').substring(0, 3);
    
    return ServiceArea.find({
      status: "active",
      "boundaries.type": "postal_codes",
      "boundaries.postalCodes": normalizedCode
    }).sort({ priority: -1 });
  }
  
  /**
   * Quick setup for Vancouver MVP - creates basic postal code areas
   */
  static async setupVancouverMVP(): Promise<{
    created: ServiceAreaDoc[];
    errors: string[];
  }> {
    const created: ServiceAreaDoc[] = [];
    const errors: string[] = [];
    
    // Vancouver area postal codes by zone
    const zones = [
      {
        name: "Downtown Vancouver",
        postalCodes: ["V6B", "V6C", "V6E"],
        serviceConfig: {
          deliveryEnabled: true,
          pickupEnabled: true,
          sameDay: true,
          nextDay: true,
          standardDelivery: true,
          expressDelivery: true
        },
        priority: 10
      },
      {
        name: "West Vancouver",
        postalCodes: ["V7V", "V7W"],
        serviceConfig: {
          deliveryEnabled: true,
          pickupEnabled: false,
          sameDay: false,
          nextDay: true,
          standardDelivery: true,
          expressDelivery: false
        },
        priority: 5
      },
      {
        name: "Richmond",
        postalCodes: ["V6X", "V6Y", "V7A"],
        serviceConfig: {
          deliveryEnabled: true,
          pickupEnabled: true,
          sameDay: false,
          nextDay: true,
          standardDelivery: true,
          expressDelivery: false
        },
        priority: 7
      },
      {
        name: "Burnaby",
        postalCodes: ["V5A", "V5B", "V5C", "V5E", "V5G", "V5H", "V5J"],
        serviceConfig: {
          deliveryEnabled: true,
          pickupEnabled: false,
          sameDay: false,
          nextDay: true,
          standardDelivery: true,
          expressDelivery: false
        },
        priority: 6
      }
    ];
    
    for (const zone of zones) {
      try {
        // Check if already exists
        const existing = await ServiceArea.findOne({ name: zone.name });
        if (!existing) {
          const area = await this.createPostalCodeArea(zone);
          created.push(area);
        }
      } catch (error) {
        errors.push(`Failed to create ${zone.name}: ${error}`);
      }
    }
    
    return { created, errors };
  }
}