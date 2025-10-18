import { DeliveryOrder } from "../models/DeliveryOrder";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { Types } from "mongoose";

export class DriverService {
  /**
   * Get driver profile by ID
   */
  static async getDriverProfile(driverId: Types.ObjectId) {
    const driver = await User.findById(driverId);

    if (!driver) {
      throw new ApiError(404, "Driver not found");
    }

    if (!driver.roles.includes("driver")) {
      throw new ApiError(403, "User is not a driver");
    }

    return {
      id: driver._id,
      uuid: driver.uuid,
      name: driver.profile?.name,
      email: driver.auth?.email,
      phone: driver.auth?.phone,
      status: driver.status,
      roles: driver.roles,
    };
  }

  /**
   * Get available orders for drivers (pending orders without driver assigned)
   */
  static async getAvailableOrders(filters?: {
    limit?: number;
    skip?: number;
  }) {
    const { limit = 20, skip = 0 } = filters || {};

    const orders = await DeliveryOrder.find({
      status: "pending",
      driverId: { $exists: false },
      paymentStatus: "paid", // Only show paid orders
    })
      .populate("userId", "uuid profile.name auth.phone")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await DeliveryOrder.countDocuments({
      status: "pending",
      driverId: { $exists: false },
      paymentStatus: "paid",
    });

    return {
      orders,
      total,
      hasMore: total > skip + limit,
    };
  }

  /**
   * Get driver's assigned orders
   */
  static async getDriverOrders(
    driverId: Types.ObjectId,
    filters?: {
      status?: string;
      limit?: number;
      skip?: number;
    }
  ) {
    const { status, limit = 20, skip = 0 } = filters || {};

    const query: any = { driverId };

    if (status) {
      query.status = status;
    }

    const orders = await DeliveryOrder.find(query)
      .populate("userId", "uuid profile.name auth.phone")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await DeliveryOrder.countDocuments(query);

    return {
      orders,
      total,
      hasMore: total > skip + limit,
    };
  }

  /**
   * Accept an available order
   */
  static async acceptOrder(orderId: string, driverId: Types.ObjectId) {
    const order = await DeliveryOrder.findOne({ orderId });

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    if (order.status !== "pending") {
      throw new ApiError(400, "Order is not available for assignment");
    }

    if (order.driverId) {
      throw new ApiError(409, "Order already assigned to another driver");
    }

    if (order.paymentStatus !== "paid") {
      throw new ApiError(400, "Order payment not confirmed");
    }

    // Verify driver exists and has driver role
    const driver = await User.findById(driverId);
    if (!driver || !driver.roles.includes("driver")) {
      throw new ApiError(403, "Invalid driver");
    }

    // Assign driver
    order.driverId = driverId;
    order.status = "assigned";
    order.timeline.assignedAt = new Date();

    await order.save();

    return order;
  }

  /**
   * Update order status (driver actions)
   */
  static async updateOrderStatus(
    orderId: string,
    driverId: Types.ObjectId,
    newStatus: "picked_up" | "in_transit" | "delivered" | "cancelled"
  ) {
    const order = await DeliveryOrder.findOne({ orderId });

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    if (!order.driverId || order.driverId.toString() !== driverId.toString()) {
      throw new ApiError(403, "Order not assigned to this driver");
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      assigned: ["picked_up", "cancelled"],
      picked_up: ["in_transit", "cancelled"],
      in_transit: ["delivered", "cancelled"],
    };

    if (!validTransitions[order.status]?.includes(newStatus)) {
      throw new ApiError(
        400,
        `Cannot transition from ${order.status} to ${newStatus}`
      );
    }

    // Update status and timeline
    order.status = newStatus;

    switch (newStatus) {
      case "picked_up":
        order.timeline.pickedUpAt = new Date();
        order.pickup.actualAt = new Date();
        break;
      case "in_transit":
        // No specific timeline field for in_transit
        break;
      case "delivered":
        order.timeline.deliveredAt = new Date();
        order.dropoff.actualAt = new Date();
        break;
      case "cancelled":
        order.timeline.cancelledAt = new Date();
        break;
    }

    await order.save();

    return order;
  }

  /**
   * Get driver statistics
   */
  static async getDriverStats(driverId: Types.ObjectId) {
    const [totalDeliveries, activeOrders, earnings] = await Promise.all([
      DeliveryOrder.countDocuments({
        driverId,
        status: "delivered",
      }),
      DeliveryOrder.countDocuments({
        driverId,
        status: { $in: ["assigned", "picked_up", "in_transit"] },
      }),
      DeliveryOrder.aggregate([
        {
          $match: {
            driverId: new Types.ObjectId(driverId),
            status: "delivered",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$pricing.total" },
          },
        },
      ]),
    ]);

    return {
      totalDeliveries,
      activeOrders,
      totalEarnings: earnings[0]?.total || 0,
    };
  }
}
