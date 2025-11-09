import { Request, Response, NextFunction } from "express";
import { UserService, SignupData } from "../services/user.service";
import { OtpService } from "../services/otp.service";
import { ApiError } from "../utils/ApiError";
import { DeliveryOrder } from "../models/DeliveryOrder";
import { Payment } from "../models/Payment";
import { InvoiceService } from "../services/invoice.service";
import { User } from "../models/user.model";

export const UserController = {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { accountType, email, phone, name, address, businessName, gstNumber }: SignupData = req.body;

      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 ~ signup ~ input data:', { accountType, email, phone, name, address, businessName, gstNumber });
      }

      // Validate required fields
      if (!accountType) {
        throw new ApiError(400, "Account type is required");
      }

      // Name and address are now mandatory
      if (!name || name.trim().length < 2) {
        throw new ApiError(400, "Name is required and must be at least 2 characters");
      }

      if (!address || address.trim().length < 10) {
        throw new ApiError(400, "Address is required");
      }

      // Verification requirements based on account type
      if (accountType === "business") {
        // Business accounts require BOTH email and phone verification
        if (!email || !phone) {
          throw new ApiError(400, "Business accounts require both email and phone number.");
        }

        const isEmailVerified = await OtpService.isEmailVerified(email, "signup");
        const isPhoneVerified = await OtpService.isIdentifierVerified(phone, "signup");

        if (process.env.NODE_ENV === 'development') {
          console.log('🚀 ~ signup ~ business verification status:', {
            email, emailVerified: isEmailVerified,
            phone, phoneVerified: isPhoneVerified
          });
        }

        if (!isEmailVerified) {
          throw new ApiError(400, "Business email must be verified with OTP before signup.");
        }

        if (!isPhoneVerified) {
          throw new ApiError(400, "Business phone number must be verified with OTP before signup.");
        }
      } else {
        // Individual accounts - at least one identifier must be verified
        let verificationChecked = false;

        if (email) {
          const isEmailVerified = await OtpService.isEmailVerified(email, "signup");
          if (process.env.NODE_ENV === 'development') {
            console.log('🚀 ~ signup ~ individual email verification status:', { email, verified: isEmailVerified });
          }

          if (!isEmailVerified) {
            throw new ApiError(400, "Email must be verified with OTP before signup.");
          }
          verificationChecked = true;
        }

        if (phone) {
          const isPhoneVerified = await OtpService.isIdentifierVerified(phone, "signup");
          if (process.env.NODE_ENV === 'development') {
            console.log('🚀 ~ signup ~ individual phone verification status:', { phone, verified: isPhoneVerified });
          }

          if (!isPhoneVerified) {
            throw new ApiError(400, "Phone number must be verified with OTP before signup.");
          }
          verificationChecked = true;
        }

        if (!verificationChecked) {
          throw new ApiError(400, "At least one contact method (email or phone) must be provided and verified.");
        }
      }

      const signupData: SignupData = {
        accountType,
        email,
        phone,
        name,
        address,
        businessName,
        gstNumber,
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 ~ signup ~ calling UserService.signup with:', signupData);
      }

      const user = await UserService.signup(signupData);

      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 ~ signup ~ user created:', {
          id: user._id,
          uuid: user.uuid,
          accountType: user.accountType,
          email: user.auth?.email,
          phone: user.auth?.phone
        });
      }

      // Mark verified identifiers in the user record
      if (email && await OtpService.isEmailVerified(email, "signup")) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🚀 ~ signup ~ marking email as verified for user');
        }
        await UserService.verifyEmail(user._id.toString());
      }

      if (phone && await OtpService.isIdentifierVerified(phone, "signup")) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🚀 ~ signup ~ marking phone as verified for user');
        }
        await UserService.verifyPhone(user._id.toString());
      }

      // Create session for the user
      // req.session.userId = user._id.toString();

      // Return user without sensitive data
      const response = {
        _id: user._id,
        uuid: user.uuid,
        accountType: user.accountType,
        roles: user.roles,
        status: user.status,
        profile: user.profile,
        businessProfile: user.businessProfile,
        email: user.auth?.email,
        phone: user.auth?.phone,
        auth: {
          email: user.auth.email,
          phone: user.auth.phone,
          emailVerifiedAt: user.auth.emailVerifiedAt,
          phoneVerifiedAt: user.auth.phoneVerifiedAt,
        },
        createdAt: user.createdAt,
      };

      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.get(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (err) {
      next(err);
    }
  },

  async getByUuid(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getByUuid(req.params.uuid);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Number(req.query.limit ?? 20);
      const skip = Number(req.query.skip ?? 0);
      const users = await UserService.list(limit, skip);
      res.json(users);
    } catch (err) {
      next(err);
    }
  },

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.verifyEmail(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({ message: "Email verified successfully", emailVerifiedAt: user.auth.emailVerifiedAt });
    } catch (err) {
      next(err);
    }
  },

  async verifyPhone(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.verifyPhone(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({ message: "Phone verified successfully", phoneVerifiedAt: user.auth.phoneVerifiedAt });
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id || req.user?._id || req.user?.id;
      if (!userId) {
        throw new ApiError(401, "User not authenticated");
      }

      const { name, address, businessName, gstNumber } = req.body;

      const user = await UserService.updateProfile(userId, {
        name,
        address,
        businessName,
        gstNumber
      });

      if (!user) return res.status(404).json({ error: "User not found" });

      res.json({
        message: "Profile updated successfully",
        profile: user.profile,
        businessProfile: user.businessProfile
      });
    } catch (err) {
      next(err);
    }
  },

  async searchByIdentifier(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier } = req.query;

      if (!identifier || typeof identifier !== 'string') {
        throw new ApiError(400, "Identifier (email or phone) is required");
      }

      // Search by email or phone
      const user = await UserService.findByIdentifier(identifier);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return user without sensitive data
      const response = {
        _id: user._id,
        uuid: user.uuid,
        accountType: user.accountType,
        email: user.auth?.email,
        phone: user.auth?.phone,
        profile: user.profile,
        businessProfile: user.businessProfile,
        roles: user.roles,
        status: user.status,
      };

      res.json({ user: response });
    } catch (err) {
      next(err);
    }
  },

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      if (!user || !user._id) {
        throw new ApiError(401, "User not authenticated");
      }

      // Return user profile without sensitive data
      const profile = {
        _id: user._id,
        uuid: user.uuid,
        accountType: user.accountType,
        email: user.auth?.email,
        phone: user.auth?.phone,
        profile: user.profile,
        businessProfile: user.businessProfile,
        roles: user.roles,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      res.json({
        success: true,
        data: profile
      });
    } catch (err) {
      next(err);
    }
  },

  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id || req.user?.id;
      if (!userId) {
        throw new ApiError(401, "User not authenticated");
      }

      const dashboardData = await UserService.getDashboardData(userId);

      res.json({
        success: true,
        data: dashboardData
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get all orders for the authenticated user
   * GET /api/users/orders
   */
  async getUserOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id || req.user?.id;
      if (!userId) {
        throw new ApiError(401, "User not authenticated");
      }

      const { limit = 20, skip = 0, status } = req.query;

      // Build query filter
      const filter: any = { userId };
      if (status) {
        filter.status = status;
      }

      // Fetch orders with pagination
      const orders = await DeliveryOrder.find(filter)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(Number(skip))
        .lean();

      const total = await DeliveryOrder.countDocuments(filter);

      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            total,
            limit: Number(limit),
            skip: Number(skip),
            hasMore: Number(skip) + orders.length < total
          }
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get a single order by orderId
   * GET /api/users/orders/:orderId
   */
  async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id || req.user?.id;
      if (!userId) {
        throw new ApiError(401, "User not authenticated");
      }

      const { orderId } = req.params;

      console.log(`🔍 [getOrder] Searching for orderId: "${orderId}" with userId: "${userId}"`);

      // Find order - ensure it belongs to the authenticated user
      const order = await DeliveryOrder.findOne({
        orderId,
        userId
      }).lean();

      console.log(`📦 [getOrder] Order found: ${order ? 'YES' : 'NO'}`);
      
      // Debug: Check if order exists with this orderId (any user)
      if (!order) {
        const anyOrder = await DeliveryOrder.findOne({ orderId }).lean();
        if (anyOrder) {
          console.log(`⚠️  [getOrder] Order exists but belongs to different user. Order userId: "${anyOrder.userId}", Requested userId: "${userId}"`);
        } else {
          console.log(`❌ [getOrder] Order does not exist in database with orderId: "${orderId}"`);
        }
        throw new ApiError(404, "Order not found");
      }

      // Get payment info if exists
      const payment = await Payment.findOne({ orderId: order._id })
        .select('status amount currency paymentMethod createdAt updatedAt')
        .lean();

      console.log(`✅ [getOrder] Returning order: ${order.orderId}, Payment status: ${payment?.status || 'NOT_FOUND'}`);

      res.json({
        success: true,
        data: {
          order,
          payment
        }
      });
    } catch (err) {
      console.error(`❌ [getOrder] Error:`, err);
      next(err);
    }
  },

  /**
   * Get invoice/receipt for an order
   * GET /api/users/orders/:orderId/invoice
   */
  async getOrderInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id || req.user?.id;
      if (!userId) {
        throw new ApiError(401, "User not authenticated");
      }

      const { orderId } = req.params;

      console.log(`📄 [getOrderInvoice] Fetching invoice for orderId: "${orderId}", userId: "${userId}"`);

      // Find order - ensure it belongs to the authenticated user
      const order = await DeliveryOrder.findOne({
        orderId,
        userId
      });

      if (!order) {
        console.log(`❌ [getOrderInvoice] Order not found for orderId: "${orderId}", userId: "${userId}"`);
        throw new ApiError(404, "Order not found");
      }

      // Only generate invoice for paid orders
      if (order.paymentStatus !== 'paid') {
        console.log(`⚠️  [getOrderInvoice] Order payment status is "${order.paymentStatus}", not "paid"`);
        throw new ApiError(400, "Invoice is only available for paid orders");
      }

      // Get user details
      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      // Get payment details
      const payment = await Payment.findOne({ orderId: order._id });

      // Generate invoice
      const invoice = InvoiceService.generateInvoice(
        order,
        user,
        payment?.stripePaymentIntentId
      );

      res.json({
        success: true,
        data: {
          invoice
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get payment history for the authenticated user
   * GET /api/users/payments
   */
  async getUserPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id || req.user?.id;
      if (!userId) {
        throw new ApiError(401, "User not authenticated");
      }

      const { limit = 20, skip = 0, status } = req.query;

      // Build query filter
      const filter: any = { userId };
      if (status) {
        filter.status = status;
      }

      // Fetch payments with pagination
      const payments = await Payment.find(filter)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(Number(skip))
        .select('orderId amount currency status paymentMethod createdAt updatedAt')
        .lean();

      const total = await Payment.countDocuments(filter);

      // Get order details for each payment
      const paymentsWithOrders = await Promise.all(
        payments.map(async (payment) => {
          const order = await DeliveryOrder.findById(payment.orderId)
            .select('orderId status pickup.address dropoff.address createdAt')
            .lean();
          return {
            ...payment,
            order
          };
        })
      );

      res.json({
        success: true,
        data: {
          payments: paymentsWithOrders,
          pagination: {
            total,
            limit: Number(limit),
            skip: Number(skip),
            hasMore: Number(skip) + payments.length < total
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }
};
