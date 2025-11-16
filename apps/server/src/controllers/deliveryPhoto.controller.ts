import { Request, Response } from "express";
import { DeliveryOrder } from "../models/DeliveryOrder";
import { ApiError } from "../utils/ApiError";
import { uploadBase64ToCloudinary } from "../utils/cloudinary";
import { logger } from "../utils/logger";

export class DeliveryPhotoController {
  /**
   * Upload pickup photo for a delivery order
   * PUT /api/delivery/:orderId/upload-pickup-photo
   */
  static async uploadPickupPhoto(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const { photo } = req.body; // Base64 encoded image
      const user = (req as any).user;

      if (!photo) {
        throw new ApiError(400, "Photo is required");
      }

      // Find the order
      const order = await DeliveryOrder.findOne({ orderId });

      if (!order) {
        throw new ApiError(404, "Order not found");
      }

      // Verify the user is the assigned driver
      if (!order.driverId || order.driverId.toString() !== user._id.toString()) {
        throw new ApiError(403, "Only the assigned driver can upload photos");
      }

      // Verify order status (should be assigned or picked_up)
      if (!["assigned", "picked_up", "in_transit"].includes(order.status)) {
        throw new ApiError(400, "Photos can only be uploaded for active deliveries");
      }

      // Validate base64 photo data
      if (typeof photo !== 'string' || photo.trim().length === 0) {
        throw new ApiError(400, "Invalid photo data provided");
      }

      // Upload to Cloudinary
      const uploadResult = await uploadBase64ToCloudinary(photo, {
        folder: `delivery-photos/${orderId}/pickup`,
        resource_type: "image",
        quality: "auto",
        width: 800,
        crop: "limit"
      });

      // Update order with photo URL
      order.pickup.photoUrl = uploadResult.secure_url;

      // Set actualAt timestamp if not already set
      if (!order.pickup.actualAt && order.status === "picked_up") {
        order.pickup.actualAt = new Date();
      }

      await order.save();

      logger.info({ orderId, photoUrl: uploadResult.secure_url }, "Pickup photo uploaded successfully");

      res.json({
        success: true,
        data: {
          photoUrl: uploadResult.secure_url,
          order: {
            orderId: order.orderId,
            status: order.status,
            pickup: order.pickup
          }
        },
        message: "Pickup photo uploaded successfully"
      });
    } catch (error: any) {
      logger.error({ 
        error: error.message,
        errorStack: error.stack,
        orderId: req.params.orderId,
        photoDataLength: req.body.photo?.length || 0
      }, "Upload pickup photo error");
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to upload pickup photo"
      });
    }
  }

  /**
   * Upload dropoff photo for a delivery order
   * PUT /api/delivery/:orderId/upload-dropoff-photo
   */
  static async uploadDropoffPhoto(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const { photo } = req.body; // Base64 encoded image
      const user = (req as any).user;

      if (!photo) {
        throw new ApiError(400, "Photo is required");
      }

      // Find the order
      const order = await DeliveryOrder.findOne({ orderId });

      if (!order) {
        throw new ApiError(404, "Order not found");
      }

      // Verify the user is the assigned driver
      if (!order.driverId || order.driverId.toString() !== user._id.toString()) {
        throw new ApiError(403, "Only the assigned driver can upload photos");
      }

      // Verify order status (should be in_transit or delivered)
      if (!["in_transit", "delivered"].includes(order.status)) {
        throw new ApiError(400, "Dropoff photos can only be uploaded during transit or after delivery");
      }

      // Validate base64 photo data
      if (typeof photo !== 'string' || photo.trim().length === 0) {
        throw new ApiError(400, "Invalid photo data provided");
      }

      // Upload to Cloudinary
      const uploadResult = await uploadBase64ToCloudinary(photo, {
        folder: `delivery-photos/${orderId}/dropoff`,
        resource_type: "image",
        quality: "auto",
        width: 800,
        crop: "limit"
      });

      // Update order with photo URL
      order.dropoff.photoUrl = uploadResult.secure_url;

      // Set actualAt timestamp if not already set
      if (!order.dropoff.actualAt && order.status === "delivered") {
        order.dropoff.actualAt = new Date();
      }

      await order.save();

      logger.info({ orderId, photoUrl: uploadResult.secure_url }, "Dropoff photo uploaded successfully");

      res.json({
        success: true,
        data: {
          photoUrl: uploadResult.secure_url,
          order: {
            orderId: order.orderId,
            status: order.status,
            dropoff: order.dropoff
          }
        },
        message: "Dropoff photo uploaded successfully"
      });
    } catch (error: any) {
      logger.error({ 
        error: error.message,
        errorStack: error.stack,
        orderId: req.params.orderId,
        photoDataLength: req.body.photo?.length || 0
      }, "Upload dropoff photo error");
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to upload dropoff photo"
      });
    }
  }
}
