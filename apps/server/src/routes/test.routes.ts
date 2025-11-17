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

    // Generate realistic timestamp: random time within last 2-6 hours
    const hoursAgo = Math.floor(Math.random() * 4) + 2; // 2-6 hours
    const minutesAgo = Math.floor(Math.random() * 60); // 0-59 minutes
    const secondsAgo = Math.floor(Math.random() * 60); // 0-59 seconds
    const millisOffset = (hoursAgo * 60 * 60 * 1000) + (minutesAgo * 60 * 1000) + (secondsAgo * 1000);
    const createdAt = new Date(Date.now());

    const expiresAt = new Date(createdAt.getTime() + 30 * 60 * 1000); // 30 minutes from "created" time

    // Generate more realistic order ID with randomized timestamp
    const randomTimestamp = createdAt.getTime();
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderId = `ORD-${randomTimestamp}-${randomSuffix}`;

    const order = await DeliveryOrder.create({
      orderId,
      userId: "68da0cc822b88a07ecf6044f",
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
        createdAt: createdAt
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
