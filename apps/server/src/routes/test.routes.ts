import { Router, Request, Response } from "express";
import { DeliveryOrder } from "../models/DeliveryOrder";
import { requireAuth } from "../middlewares/auth";

const router = Router();

/**
 * TEST ENDPOINT - Create a test order
 * POST /api/test/create-order
 */
router.post("/create-order", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes

    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const order = await DeliveryOrder.create({
      orderId,
      userId: user._id,
      status: "pending",
      paymentStatus: "paid", // Auto-paid for testing
      pickup: {
        address: "Langley Events Centre, 200 Street, Langley Township, BC, Canada",
        coordinates: {
          lat: 49.145852,
          lng: -122.6664584
        },
        location: {
          type: "Point",
          coordinates: [-122.6664584, 49.145852]
        },
        contactName: "Test Pickup",
        contactPhone: "7785832260"
      },
      dropoff: {
        address: "Langley Memorial Hospital, Fraser Highway, Langley Township, BC, Canada",
        coordinates: {
          lat: 49.0954172,
          lng: -122.6124954
        },
        location: {
          type: "Point",
          coordinates: [-122.6124954, 49.0954172]
        },
        contactName: "Test Dropoff",
        contactPhone: "1212212113"
      },
      package: {
        size: "M",
        description: "Test order"
      },
      pricing: {
        baseFare: 1232,
        distanceSurcharge: 0,
        fees: {
          bcCourierFee: 0,
          bcCarbonFee: 0,
          serviceFee: 0,
          gst: 67
        },
        subtotal: 1232,
        tax: 67,
        total: 1409,
        currency: "CAD",
        couponDiscount: 0
      },
      distance: {
        km: 9.25,
        durationMinutes: 14
      },
      timeline: {
        createdAt: now
      },
      expiresAt
    });

    res.json({
      success: true,
      data: { order },
      message: "Test order created successfully"
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create test order"
    });
  }
});

export default router;
