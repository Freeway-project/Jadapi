import { Request, Response } from "express";
import { ServiceAreaService } from "../services/serviceArea.service";
import { DeliveryAreaValidator } from "../utils/deliveryAreaValidator";
import { ServiceArea } from "../models/ServiceArea";

export class DeliveryAreaController {
  
  /**
   * Validate if delivery is available for a given address
   * POST /api/delivery/validate
   */
  static async validateDeliveryLocation(req: Request, res: Response): Promise<void> {
    try {
      const { lat, lng, postalCode, address } = req.body;
      
      if (!lat && !lng && !postalCode) {
        res.status(400).json({
          success: false,
          message: "Please provide either coordinates (lat/lng) or postal code"
        });
        return;
      }
      
      const validation = await ServiceAreaService.validateLocationForBooking(lat, lng, postalCode);
      
      res.json({
        success: true,
        data: {
          canDeliver: validation.canServe,
          serviceArea: validation.serviceArea ? {
            id: validation.serviceArea._id,
            name: validation.serviceArea.name,
            description: validation.serviceArea.description
          } : null,
          availableServices: validation.availableServices,
          message: validation.message,
          restrictions: {
            sameDay: validation.availableServices.includes('sameDay'),
            nextDay: validation.availableServices.includes('nextDay'),
            pickup: validation.availableServices.includes('pickup'),
            delivery: validation.availableServices.includes('delivery'),
            express: validation.availableServices.includes('express')
          }
        }
      });
      
    } catch (error) {
      console.error('Delivery validation error:', error);
      res.status(500).json({
        success: false,
        message: "Error validating delivery location",
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
  
  /**
   * Get all active service areas
   * GET /api/delivery/areas
   */
  static async getServiceAreas(req: Request, res: Response): Promise<void> {
    try {
      const areas = await ServiceAreaService.getActiveAreas();
      
      const formattedAreas = areas.map(area => ({
        id: area._id,
        name: area.name,
        description: area.description,
        status: area.status,
        boundaryType: area.boundaries.type,
        postalCodes: area.boundaries.type === 'postal_codes' ? area.boundaries.postalCodes : undefined,
        radius: area.boundaries.type === 'radius' ? {
          center: area.boundaries.radius?.center,
          radiusKm: area.boundaries.radius?.radiusKm
        } : undefined,
        serviceConfig: area.serviceConfig,
        priority: area.priority
      }));
      
      res.json({
        success: true,
        data: formattedAreas
      });
      
    } catch (error) {
      console.error('Error fetching service areas:', error);
      res.status(500).json({
        success: false,
        message: "Error fetching service areas"
      });
    }
  }
  
  /**
   * Check if postal code is serviced
   * GET /api/delivery/postal/:code
   */
  static async checkPostalCode(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;
      
      if (!code || !/^[A-Za-z]\d[A-Za-z]/.test(code)) {
        res.status(400).json({
          success: false,
          message: "Invalid postal code format. Use format like V6B"
        });
        return;
      }
      
      const areas = await ServiceAreaService.getAreasForPostalCode(code);
      const validation = await DeliveryAreaValidator.validatePostalCode(code);
      
      res.json({
        success: true,
        data: {
          postalCode: code.toUpperCase(),
          isServiced: validation.isValid,
          serviceAreas: areas.map(area => ({
            id: area._id,
            name: area.name,
            priority: area.priority,
            services: area.serviceConfig
          })),
          primaryArea: areas[0] ? {
            name: areas[0].name,
            services: areas[0].serviceConfig
          } : null,
          message: validation.reasons.join('. ')
        }
      });
      
    } catch (error) {
      console.error('Error checking postal code:', error);
      res.status(500).json({
        success: false,
        message: "Error checking postal code"
      });
    }
  }
  
  /**
   * Bulk validate multiple addresses
   * POST /api/delivery/validate-bulk
   */
  static async validateBulkAddresses(req: Request, res: Response): Promise<void> {
    try {
      const { addresses } = req.body;
      
      if (!Array.isArray(addresses) || addresses.length === 0) {
        res.status(400).json({
          success: false,
          message: "Please provide an array of addresses to validate"
        });
        return;
      }
      
      if (addresses.length > 50) {
        res.status(400).json({
          success: false,
          message: "Maximum 50 addresses per bulk validation"
        });
        return;
      }
      
      const results = await Promise.all(
        addresses.map(async (addr: any, index: number) => {
          try {
            const validation = await ServiceAreaService.validateLocationForBooking(
              addr.lat, 
              addr.lng, 
              addr.postalCode
            );
            
            return {
              index,
              address: addr,
              canDeliver: validation.canServe,
              serviceArea: validation.serviceArea?.name,
              availableServices: validation.availableServices,
              message: validation.message
            };
          } catch (error) {
            return {
              index,
              address: addr,
              canDeliver: false,
              error: `Validation failed: ${error}`
            };
          }
        })
      );
      
      const summary = {
        total: results.length,
        serviceable: results.filter(r => r.canDeliver).length,
        unserviceable: results.filter(r => !r.canDeliver).length
      };
      
      res.json({
        success: true,
        data: {
          summary,
          results
        }
      });
      
    } catch (error) {
      console.error('Bulk validation error:', error);
      res.status(500).json({
        success: false,
        message: "Error during bulk validation"
      });
    }
  }
  
  /**
   * Setup Vancouver MVP service areas (admin only)
   * POST /api/delivery/setup-mvp
   */
  static async setupMVP(req: Request, res: Response): Promise<void> {
    try {
      // Add admin auth check here
      // if (!req.user?.roles.includes('admin')) {
      //   return res.status(403).json({ success: false, message: 'Admin access required' });
      // }
      
      const result = await ServiceAreaService.setupVancouverMVP();
      
      res.json({
        success: true,
        message: `Created ${result.created.length} service areas`,
        data: {
          created: result.created.map(area => ({
            id: area._id,
            name: area.name,
            postalCodes: area.boundaries.postalCodes
          })),
          errors: result.errors
        }
      });
      
    } catch (error) {
      console.error('MVP setup error:', error);
      res.status(500).json({
        success: false,
        message: "Error setting up MVP areas"
      });
    }
  }
  
  /**
   * Get delivery statistics
   * GET /api/delivery/stats
   */
  static async getDeliveryStats(req: Request, res: Response): Promise<void> {
    try {
      const totalAreas = await ServiceArea.countDocuments();
      const activeAreas = await ServiceArea.countDocuments({ status: 'active' });
      const inactiveAreas = await ServiceArea.countDocuments({ status: 'inactive' });
      
      // Get postal codes coverage
      const postalCodeAreas = await ServiceArea.find({ 
        status: 'active',
        'boundaries.type': 'postal_codes' 
      });
      
      const totalPostalCodes = postalCodeAreas.reduce((total, area) => {
        return total + (area.boundaries.postalCodes?.length || 0);
      }, 0);
      
      const areasByType = await ServiceArea.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: '$boundaries.type', count: { $sum: 1 } } }
      ]);
      
      res.json({
        success: true,
        data: {
          overview: {
            totalAreas,
            activeAreas,
            inactiveAreas,
            totalPostalCodes
          },
          areasByType: areasByType.reduce((acc: any, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          serviceCapabilities: {
            sameDay: await ServiceArea.countDocuments({ 
              status: 'active', 
              'serviceConfig.sameDay': true 
            }),
            nextDay: await ServiceArea.countDocuments({ 
              status: 'active', 
              'serviceConfig.nextDay': true 
            }),
            pickup: await ServiceArea.countDocuments({ 
              status: 'active', 
              'serviceConfig.pickupEnabled': true 
            }),
            express: await ServiceArea.countDocuments({ 
              status: 'active', 
              'serviceConfig.expressDelivery': true 
            })
          }
        }
      });
      
    } catch (error) {
      console.error('Error fetching delivery stats:', error);
      res.status(500).json({
        success: false,
        message: "Error fetching delivery statistics"
      });
    }
  }
}