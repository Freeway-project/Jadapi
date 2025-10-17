import { ServiceArea, ServiceAreaDoc } from "../models/ServiceArea";

export class CityServiceAreaService {
  
  /**
   * Create a new service area (Admin only)
   */
  static async createServiceArea(data: {
    name: string;
    type?: "city" | "district" | "region";
    province?: string;
    country?: string;
    postalCodePatterns: string[];
    deliveryFee?: number;
    estimatedDeliveryHours?: number;
  }): Promise<ServiceAreaDoc> {
    const serviceArea = new ServiceArea({
      name: data.name.trim(),
      type: data.type || "city",
      province: data.province || "BC",
      country: data.country || "CA", 
      postalCodePatterns: data.postalCodePatterns.map((p: string) => p.trim().toUpperCase()),
      isActive: true,
      deliveryFee: data.deliveryFee,
      estimatedDeliveryHours: data.estimatedDeliveryHours
    });

    return await serviceArea.save();
  }

  /**
   * Get all service areas with optional filtering
   */
  static async getAllServiceAreas(filters?: {
    isActive?: boolean;
    province?: string;
    type?: string;
  }): Promise<ServiceAreaDoc[]> {
    const query: any = {};
    
    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    if (filters?.province) {
      query.province = filters.province;
    }
    if (filters?.type) {
      query.type = filters.type;
    }

    return await ServiceArea.find(query).sort({ name: 1 });
  }

  /**
   * Update a service area (Admin only)
   */
  static async updateServiceArea(
    id: string, 
    updates: Partial<{
      name: string;
      postalCodePatterns: string[];
      isActive: boolean;
      deliveryFee: number;
      estimatedDeliveryHours: number;
    }>
  ): Promise<ServiceAreaDoc | null> {
    if (updates.postalCodePatterns) {
      updates.postalCodePatterns = updates.postalCodePatterns.map((p: string) => p.trim().toUpperCase());
    }

    return await ServiceArea.findByIdAndUpdate(id, updates, { new: true });
  }

  /**
   * Toggle service area active status (Admin only) 
   */
  static async toggleServiceArea(id: string, isActive: boolean): Promise<ServiceAreaDoc | null> {
    return await ServiceArea.findByIdAndUpdate(
      id, 
      { isActive }, 
      { new: true }
    );
  }

  /**
   * Delete a service area (Admin only)
   */
  static async deleteServiceArea(id: string): Promise<boolean> {
    const result = await ServiceArea.findByIdAndDelete(id);
    return result !== null;
  }

  /**
   * Get service area statistics
   */
  static async getServiceAreaStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byType: Record<string, number>;
    byProvince: Record<string, number>;
  }> {
    const [totalStats, typeStats, provinceStats] = await Promise.all([
      ServiceArea.aggregate([
        {
          $group: {
            _id: "$isActive",
            count: { $sum: 1 }
          }
        }
      ]),
      ServiceArea.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: "$type", 
            count: { $sum: 1 }
          }
        }
      ]),
      ServiceArea.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: "$province",
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const stats = {
      total: 0,
      active: 0, 
      inactive: 0,
      byType: {} as Record<string, number>,
      byProvince: {} as Record<string, number>
    };

    // Process total/active/inactive counts
    totalStats.forEach((stat: any) => {
      if (stat._id === true) {
        stats.active = stat.count;
      } else {
        stats.inactive = stat.count;
      }
    });
    stats.total = stats.active + stats.inactive;

    // Process type breakdown
    typeStats.forEach((stat: any) => {
      stats.byType[stat._id] = stat.count;
    });

    // Process province breakdown  
    provinceStats.forEach((stat: any) => {
      stats.byProvince[stat._id] = stat.count;
    });

    return stats;
  }
}