import { DeliveryOrder } from "../models/DeliveryOrder";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { Types } from "mongoose";
import { sendSms, SmsTemplates } from "../utils/SmsClient";
import { logger } from "../utils/logger";

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
    const now = new Date();

    const orders = await DeliveryOrder.find({
      status: "pending",
      driverId: { $exists: false },
      paymentStatus: "paid", // Only show paid orders
      expiresAt: { $gt: now } // Only show orders that haven't expired
    })
      .populate("userId", "uuid profile.name auth.phone")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await DeliveryOrder.countDocuments({
      status: "pending",
      driverId: { $exists: false },
      paymentStatus: "paid",
      expiresAt: { $gt: now }
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

    console.log('🔍 getDriverOrders - Query:', JSON.stringify(query));
    console.log('🔍 getDriverOrders - DriverId:', driverId.toString());

    const orders = await DeliveryOrder.find(query)
      .populate("userId", "uuid profile.name auth.phone")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await DeliveryOrder.countDocuments(query);

    console.log('✅ getDriverOrders - Found:', orders.length, 'orders');
    console.log('📊 getDriverOrders - Order IDs:', orders.map(o => o.orderId));

    return {
      orders,
      total,
      hasMore: total > skip + limit,
    };
  }

  /**
   * Accept an available order
   * @param orderIdOrMongoId - Can be either orderId (ORD-XXX) or MongoDB _id
   */
  static async acceptOrder(orderIdOrMongoId: string, driverId: Types.ObjectId) {
    // Try to find by orderId first, then by _id
    let order = await DeliveryOrder.findOne({ orderId: orderIdOrMongoId });

    // If not found by orderId, try by MongoDB _id
    if (!order && Types.ObjectId.isValid(orderIdOrMongoId)) {
      order = await DeliveryOrder.findById(orderIdOrMongoId);
    }

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Check if order is cancelled
    if (order.status === "cancelled") {
      throw new ApiError(400, "This order has been cancelled and cannot be accepted");
    }

    // Check if order has expired (past 30-minute window)
    if (order.expiresAt && new Date() > order.expiresAt) {
      throw new ApiError(400, "This order has expired and is no longer available");
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
    order.expiresAt = undefined; // Clear expiry since order is now assigned

    await order.save();

    // Send SMS notifications to sender and receiver
    const driverName = driver.profile?.name || "your driver";

    // Send SMS to sender (pickup contact)
    if (order.pickup?.contactPhone) {
      try {
        const senderMessage = SmsTemplates.orderAcceptedSender(order.orderId, driverName);
        await sendSms({
          phoneE164: order.pickup.contactPhone,
          message: senderMessage,
          type: "delivery",
          source: "system",
          metadata: {
            orderId: order.orderId,
            event: "order_accepted",
            recipient: "sender"
          }
        });
        logger.info(`SMS sent to sender (pickup) for order ${order.orderId}`);
      } catch (error) {
        logger.error(`Failed to send SMS to sender for order ${order.orderId}:`, error);
        // Don't throw error - SMS failure shouldn't block the order acceptance
      }
    }

    // Send SMS to receiver (dropoff contact)
    if (order.dropoff?.contactPhone) {
      try {
        const receiverMessage = SmsTemplates.orderAcceptedReceiver(order.orderId, driverName);
        await sendSms({
          phoneE164: order.dropoff.contactPhone,
          message: receiverMessage,
          type: "delivery",
          source: "system",
          metadata: {
            orderId: order.orderId,
            event: "order_accepted",
            recipient: "receiver"
          }
        });
        logger.info(`SMS sent to receiver (dropoff) for order ${order.orderId}`);
      } catch (error) {
        logger.error(`Failed to send SMS to receiver for order ${order.orderId}:`, error);
        // Don't throw error - SMS failure shouldn't block the order acceptance
      }
    }

    return order;
  }

  /**
   * Update order status (driver actions)
   * @param orderIdOrMongoId - Can be either orderId (ORD-XXX) or MongoDB _id
   */
  static async updateOrderStatus(
    orderIdOrMongoId: string,
    driverId: Types.ObjectId,
    newStatus: "picked_up" | "in_transit" | "delivered" | "cancelled"
  ) {
    // Try to find by orderId first, then by _id
    let order = await DeliveryOrder.findOne({ orderId: orderIdOrMongoId });

    // If not found by orderId, try by MongoDB _id
    if (!order && Types.ObjectId.isValid(orderIdOrMongoId)) {
      order = await DeliveryOrder.findById(orderIdOrMongoId);
    }

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    if (!order.driverId || order.driverId.toString() !== driverId.toString()) {
      throw new ApiError(403, "Order not assigned to this driver");
    }

    // Validate status transitions (one-way flow)
    const validTransitions: Record<string, string[]> = {
      assigned: ["picked_up", "cancelled"],
      picked_up: ["in_transit", "cancelled"],
      in_transit: ["delivered", "cancelled"],
      delivered: [], // Terminal state - no further transitions allowed
      cancelled: [], // Terminal state - no further transitions allowed
    };

    // Check if current status allows any transitions
    if (!validTransitions[order.status]) {
      throw new ApiError(
        400,
        `Invalid current status: ${order.status}`
      );
    }

    // Check if transition is allowed
    if (!validTransitions[order.status].includes(newStatus)) {
      throw new ApiError(
        400,
        `Cannot change status from ${order.status} to ${newStatus}. ${order.status === 'delivered' || order.status === 'cancelled' ? 'This order is already completed.' : ''}`
      );
    }

    // Update status and timeline
    order.status = newStatus;

    // Get driver info for SMS notifications
    const driver = await User.findById(driverId);
    const driverName = driver?.profile?.name || "your driver";

    switch (newStatus) {
      case "picked_up":
        order.timeline.pickedUpAt = new Date();
        order.pickup.actualAt = new Date();

        // Send SMS notifications for pickup
        // SMS to sender (pickup contact)
        if (order.pickup?.contactPhone) {
          try {
            const senderMessage = SmsTemplates.packagePickedUpSender(order.orderId, driverName);
            await sendSms({
              phoneE164: order.pickup.contactPhone,
              message: senderMessage,
              type: "delivery",
              source: "system",
              metadata: {
                orderId: order.orderId,
                event: "package_picked_up",
                recipient: "sender"
              }
            });
            logger.info(`SMS sent to sender (pickup) for package pickup ${order.orderId}`);
          } catch (error) {
            logger.error(`Failed to send pickup SMS to sender for order ${order.orderId}:`, error);
          }
        }

        // SMS to receiver (dropoff contact)
        if (order.dropoff?.contactPhone) {
          try {
            const receiverMessage = SmsTemplates.packagePickedUpReceiver(order.orderId, driverName);
            await sendSms({
              phoneE164: order.dropoff.contactPhone,
              message: receiverMessage,
              type: "delivery",
              source: "system",
              metadata: {
                orderId: order.orderId,
                event: "package_picked_up",
                recipient: "receiver"
              }
            });
            logger.info(`SMS sent to receiver (dropoff) for package pickup ${order.orderId}`);
          } catch (error) {
            logger.error(`Failed to send pickup SMS to receiver for order ${order.orderId}:`, error);
          }
        }
        break;

      case "in_transit":
        // No specific timeline field for in_transit
        break;

      case "delivered":
        order.timeline.deliveredAt = new Date();
        order.dropoff.actualAt = new Date();

        // Send SMS notifications for delivery
        // SMS to sender (pickup contact)
        if (order.pickup?.contactPhone) {
          try {
            const senderMessage = SmsTemplates.packageDeliveredSender(order.orderId);
            await sendSms({
              phoneE164: order.pickup.contactPhone,
              message: senderMessage,
              type: "delivery",
              source: "system",
              metadata: {
                orderId: order.orderId,
                event: "package_delivered",
                recipient: "sender"
              }
            });
            logger.info(`SMS sent to sender (pickup) for delivery completion ${order.orderId}`);
          } catch (error) {
            logger.error(`Failed to send delivery SMS to sender for order ${order.orderId}:`, error);
          }
        }

        // SMS to receiver (dropoff contact)
        if (order.dropoff?.contactPhone) {
          try {
            const receiverMessage = SmsTemplates.packageDeliveredReceiver(order.orderId);
            await sendSms({
              phoneE164: order.dropoff.contactPhone,
              message: receiverMessage,
              type: "delivery",
              source: "system",
              metadata: {
                orderId: order.orderId,
                event: "package_delivered",
                recipient: "receiver"
              }
            });
            logger.info(`SMS sent to receiver (dropoff) for delivery completion ${order.orderId}`);
          } catch (error) {
            logger.error(`Failed to send delivery SMS to receiver for order ${order.orderId}:`, error);
          }
        }
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

  /**
   * Get driver's past/completed orders
   */
  static async getPastOrders(
    driverId: Types.ObjectId,
    filters?: {
      limit?: number;
      skip?: number;
    }
  ) {
    const { limit = 20, skip = 0 } = filters || {};

    const query = {
      driverId,
      status: { $in: ["delivered", "cancelled"] }
    };

    const orders = await DeliveryOrder.find(query)
      .populate("userId", "uuid profile.name auth.phone")
      .sort({ "timeline.deliveredAt": -1, "timeline.cancelledAt": -1, createdAt: -1 })
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
   * Update driver note for an order
   */
  static async updateDriverNote(
    orderIdOrMongoId: string,
    driverId: Types.ObjectId,
    note: string
  ) {
    // Try to find by orderId first, then by _id
    let order = await DeliveryOrder.findOne({ orderId: orderIdOrMongoId });

    if (!order && Types.ObjectId.isValid(orderIdOrMongoId)) {
      order = await DeliveryOrder.findById(orderIdOrMongoId);
    }

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    if (!order.driverId || order.driverId.toString() !== driverId.toString()) {
      throw new ApiError(403, "Order not assigned to this driver");
    }

    order.driverNote = note;
    await order.save();

    return order;
  }
}
