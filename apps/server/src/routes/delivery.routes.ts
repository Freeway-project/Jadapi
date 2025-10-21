import { Router, Request, Response } from "express";
import { DeliveryAreaValidator } from "../utils/cityDeliveryValidator";
import { CityServiceAreaService } from "../services/cityServiceArea.service";
import { ApiError } from "../utils/ApiError";
import { DeliveryOrder } from "../models/DeliveryOrder";
import { authenticate } from "../middlewares/auth";
import { CouponService } from "../services/coupon.service";
import { checkAppActive } from "../middlewares/appActive";
import { logger } from "../utils/logger";

const router = Router();

// Apply app active check to all delivery routes
router.use(checkAppActive);

/**
 * POST /api/delivery/check-address
 * Check if delivery is available for a specific address
 */
router.post("/check-address", async (req: Request, res: Response) => {
  try {
    const { city, postalCode } = req.body;

    if (!city) {
      throw new ApiError(400, "City is required");
    }

    const result = await DeliveryAreaValidator.isDeliveryAvailable(
      city,
      postalCode
    );

    res.json({
      success: true,
      data: {
        deliveryAvailable: result.available,
        message: result.message,
        serviceArea: result.serviceArea ? {
          name: result.serviceArea.name,
          deliveryFee: result.serviceArea.deliveryFee,
          estimatedDeliveryHours: result.serviceArea.estimatedDeliveryHours
        } : null
      }
    });
  } catch (error) {
    logger.error({ error }, "delivery.routes - Check address error");
    res.status(500).json({
      success: false,
      message: "Failed to check delivery availability"
    });
  }
});

/**
 * POST /api/delivery/validate-order-address
 * Validate address for order creation (returns detailed validation)
 */
router.post("/validate-order-address", async (req: Request, res: Response) => {
  try {
    const { city, pincode } = req.body;

    if (!city || !pincode) {
      throw new ApiError(400, "City and postal code are required");
    }

    const validation = await DeliveryAreaValidator.validateAddressForDelivery({
      city,
      pincode
    });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    res.json({
      success: true,
      data: {
        valid: true,
        deliveryFee: validation.deliveryFee,
        estimatedDeliveryHours: validation.estimatedHours,
        message: "Address is valid for delivery"
      }
    });
  } catch (error) {
    logger.error({ error }, "delivery.routes - Validate order address error");
    res.status(500).json({
      success: false,
      message: "Failed to validate address"
    });
  }
});

/**
 * GET /api/delivery/service-areas
 * Get all active delivery areas
 */
router.get("/service-areas", async (_req: Request, res: Response) => {
  try {
    const areas = await DeliveryAreaValidator.getActiveDeliveryAreas();

    res.json({
      success: true,
      data: {
        serviceAreas: areas,
        count: areas.length
      }
    });
  } catch (error) {
    logger.error({ error }, "delivery.routes - Get service areas error");
    res.status(500).json({
      success: false,
      message: "Failed to fetch service areas"
    });
  }
});

/**
 * POST /api/delivery/create-order
 * Create a new delivery order (with optional coupon)
 */
router.post("/create-order", authenticate, async (req: Request, res: Response) => {
  try {
    const {
      pickup,
      dropoff,
      package: packageDetails,
      pricing,
      distance,
      couponCode
    } = req.body;

    const user = (req as any).user;

    // Require authentication
    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    // Validate required fields
    if (!pickup?.address || !pickup?.coordinates || !pickup?.contactName || !pickup?.contactPhone) {
      throw new ApiError(400, "Pickup address, coordinates, contact name and phone are required");
    }

    if (!dropoff?.address || !dropoff?.coordinates || !dropoff?.contactName || !dropoff?.contactPhone) {
      throw new ApiError(400, "Dropoff address, coordinates, contact name and phone are required");
    }

    if (!packageDetails?.size) {
      throw new ApiError(400, "Package size is required");
    }

    if (!pricing || !distance) {
      throw new ApiError(400, "Pricing and distance information are required");
    }

    let finalPricing = { ...pricing };
    let couponData = undefined;

    // Handle coupon if provided
    if (couponCode) {
      const validation = await CouponService.validateCoupon(
        couponCode,
        user._id,
        pricing.total,
        user?.accountType
      );

      if (!validation.valid) {
        throw new ApiError(400, validation.message || "Invalid coupon");
      }

      // Calculate discount
      const discount = CouponService.calculateDiscount(
        validation.coupon!,
        pricing.subtotal,
        pricing.baseFare
      );

      // Update pricing with discount
      finalPricing.couponDiscount = discount;
      finalPricing.total = pricing.total - discount;

      // Store coupon info
      couponData = {
        code: validation.coupon!.code,
        couponId: validation.coupon!._id,
        discountType: validation.coupon!.discountType,
        discountValue: validation.coupon!.discountValue
      };

      // Increment coupon usage
      await CouponService.applyCoupon(validation.coupon!._id);
    }

    // Generate unique order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Create order
    const order = await DeliveryOrder.create({
      orderId,
      userId: user._id,
      status: "pending",
      paymentStatus: "unpaid",
      pickup: {
        address: pickup.address,
        coordinates: pickup.coordinates,
        location: {
          type: "Point",
          coordinates: [pickup.coordinates.lng, pickup.coordinates.lat] // GeoJSON: [lng, lat]
        },
        contactName: pickup.contactName,
        contactPhone: pickup.contactPhone,
        notes: pickup.notes,
        scheduledAt: pickup.scheduledAt ? new Date(pickup.scheduledAt) : undefined
      },
      dropoff: {
        address: dropoff.address,
        coordinates: dropoff.coordinates,
        location: {
          type: "Point",
          coordinates: [dropoff.coordinates.lng, dropoff.coordinates.lat] // GeoJSON: [lng, lat]
        },
        contactName: dropoff.contactName,
        contactPhone: dropoff.contactPhone,
        notes: dropoff.notes,
        scheduledAt: dropoff.scheduledAt ? new Date(dropoff.scheduledAt) : undefined
      },
      package: {
        size: packageDetails.size,
        weight: packageDetails.weight,
        description: packageDetails.description
      },
      pricing: finalPricing,
      coupon: couponData,
      distance: {
        km: distance.distanceKm || distance.km,
        durationMinutes: distance.durationMinutes
      },
      timeline: {
        createdAt: new Date()
      }
    });

    res.status(201).json({
      success: true,
      data: { order },
      message: couponCode ? "Order created successfully with coupon applied" : "Order created successfully"
    });
  } catch (error: any) {
    logger.error({ error, userId: (req as any).user?._id }, "delivery.routes - Create order error");
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create order"
    });
  }
});

// ADMIN ROUTES (require authentication/authorization in real app)

/**
 * POST /api/delivery/admin/service-areas
 * Create new service area (Admin only)
 */
router.post("/admin/service-areas", async (req: Request, res: Response) => {
  try {
    const { name, type, postalCodePatterns, deliveryFee, estimatedDeliveryHours } = req.body;

    if (!name || !postalCodePatterns || !Array.isArray(postalCodePatterns)) {
      throw new ApiError(400, "Name and postal code patterns are required");
    }

    const serviceArea = await CityServiceAreaService.createServiceArea({
      name,
      type,
      postalCodePatterns,
      deliveryFee,
      estimatedDeliveryHours
    });

    res.status(201).json({
      success: true,
      data: { serviceArea },
      message: `Service area '${name}' created successfully`
    });
  } catch (error: any) {
    logger.error({ error }, "delivery.routes - Create service area error");
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message: "Service area already exists for this city in the province"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to create service area"
      });
    }
  }
});

/**
 * GET /api/delivery/admin/service-areas
 * Get all service areas with admin details
 */
router.get("/admin/service-areas", async (req: Request, res: Response) => {
  try {
    const { isActive, province, type } = req.query;
    
    const filters: any = {};
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (province) filters.province = province as string;
    if (type) filters.type = type as string;

    const serviceAreas = await CityServiceAreaService.getAllServiceAreas(filters);
    const stats = await CityServiceAreaService.getServiceAreaStats();

    res.json({
      success: true,
      data: {
        serviceAreas,
        stats,
        filters: filters
      }
    });
  } catch (error) {
    logger.error({ error }, "delivery.routes - Get admin service areas error");
    res.status(500).json({
      success: false,
      message: "Failed to fetch service areas"
    });
  }
});

/**
 * PUT /api/delivery/admin/service-areas/:id
 * Update service area
 */
router.put("/admin/service-areas/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const serviceArea = await CityServiceAreaService.updateServiceArea(id, updates);
    
    if (!serviceArea) {
      throw new ApiError(404, "Service area not found");
    }

    res.json({
      success: true,
      data: { serviceArea },
      message: "Service area updated successfully"
    });
  } catch (error) {
    logger.error({ error, id: req.params.id }, "delivery.routes - Update service area error");
    res.status(500).json({
      success: false,
      message: "Failed to update service area"
    });
  }
});

/**
 * PUT /api/delivery/admin/service-areas/:id/toggle
 * Toggle service area active status
 */
router.put("/admin/service-areas/:id/toggle", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const serviceArea = await CityServiceAreaService.toggleServiceArea(id, isActive);
    
    if (!serviceArea) {
      throw new ApiError(404, "Service area not found");
    }

    res.json({
      success: true,
      data: { serviceArea },
      message: `Service area ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    logger.error({ error, id: req.params.id }, "delivery.routes - Toggle service area error");
    res.status(500).json({
      success: false,
      message: "Failed to toggle service area"
    });
  }
});

export default router;