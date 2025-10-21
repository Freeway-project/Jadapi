import { Request, Response, NextFunction } from "express";
import { AdminService } from "../services/admin.service";
import { AppConfigService } from "../services/appConfig.service";
import { SmsRateLimitService } from "../services/smsRateLimit.service";
import { ApiError } from "../utils/ApiError";
import { EarlyAccessRequest } from "../models/EarlyAccessRequest";

export class AdminController {
  /**
   * GET /api/admin/dashboard/stats
   */
  static async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await AdminService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/activity
   */
  static async getRecentActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = parseInt(req.query.skip as string) || 0;

      const result = await AdminService.getRecentActivity(limit, skip);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/activity/user/:userId
   */
  static async getUserActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const activities = await AdminService.getUserActivity(userId, limit);
      res.json({ success: true, data: activities });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/orders/active
   */
  static async getActiveOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = parseInt(req.query.skip as string) || 0;

      const result = await AdminService.getActiveOrders(limit, skip);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/orders
   */
  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        status: req.query.status as string,
        userId: req.query.userId as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        limit: parseInt(req.query.limit as string) || 50,
        skip: parseInt(req.query.skip as string) || 0,
      };

      const result = await AdminService.getOrders(filters);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/users
   */
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        role: req.query.role as string,
        status: req.query.status as string,
        search: req.query.search as string,
        limit: parseInt(req.query.limit as string) || 50,
        skip: parseInt(req.query.skip as string) || 0,
      };

      const result = await AdminService.getUsers(filters);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/metrics
   */
  static async getSystemMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await AdminService.getSystemMetrics();
      res.json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/sms/usage
   * Get SMS usage statistics
   */
  static async getSmsUsage(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await SmsRateLimitService.getUsageStats();

      // Calculate usage percentages
      const usagePercentages = {
        hourly: (stats.hourly / stats.limits.global.hourly) * 100,
        daily: (stats.daily / stats.limits.global.daily) * 100,
        monthly: (stats.monthly / stats.limits.global.monthly) * 100,
        costDaily: (stats.costDaily / stats.limits.costs.dailyLimit) * 100,
        costMonthly: (stats.costMonthly / stats.limits.costs.monthlyLimit) * 100,
      };

      // Warnings if approaching limits
      const warnings = [];
      if (usagePercentages.hourly > 80) warnings.push("Hourly limit approaching (>80%)");
      if (usagePercentages.daily > 80) warnings.push("Daily limit approaching (>80%)");
      if (usagePercentages.monthly > 80) warnings.push("Monthly limit approaching (>80%)");
      if (usagePercentages.costDaily > 80) warnings.push("Daily cost limit approaching (>80%)");
      if (usagePercentages.costMonthly > 80) warnings.push("Monthly cost limit approaching (>80%)");

      res.json({
        success: true,
        data: {
          usage: stats,
          percentages: usagePercentages,
          warnings,
          status: warnings.length > 0 ? "warning" : "healthy",
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/drivers
   * Create a new driver account
   */
  static async createDriver(req: Request, res: Response, next: NextFunction) {
    try {
      const driverData = {
        email: req.body.email,
        phone: req.body.phone,
        name: req.body.name,
        vehicleType: req.body.vehicleType,
        licenseNumber: req.body.licenseNumber,
      };

      const driver = await AdminService.createDriver(driverData);
      res.status(201).json({
        success: true,
        data: driver,
        message: 'Driver account created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/drivers
   * Get all drivers
   */
  static async getDrivers(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        status: req.query.status as string,
        search: req.query.search as string,
        limit: parseInt(req.query.limit as string) || 50,
        skip: parseInt(req.query.skip as string) || 0,
      };

      const result = await AdminService.getDrivers(filters);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/admin/drivers/:driverId/status
   * Update driver status
   */
  static async updateDriverStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { driverId } = req.params;
      const { status } = req.body;

      const driver = await AdminService.updateDriverStatus(driverId, status);
      res.json({
        success: true,
        data: driver,
        message: `Driver status updated to ${status}`
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/config
   * Get app configuration
   */
  static async getAppConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const config = await AppConfigService.getFullConfig();
      res.json({ success: true, data: config });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/admin/config/active
   * Update app active status
   */
  static async updateAppActiveStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { isActive } = req.body;
      const updatedBy = (req as any).user?.email || (req as any).user?.phone || 'admin';

      if (typeof isActive !== 'boolean') {
        throw new ApiError(400, 'isActive must be a boolean value');
      }

      const config = await AppConfigService.updateAppActiveStatus(isActive, updatedBy);

      res.json({
        success: true,
        data: config,
        message: `App is now ${isActive ? 'active' : 'inactive'}`
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/early-access-requests
   * Get all early access requests
   */
  static async getEarlyAccessRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        status: req.query.status as string,
        limit: parseInt(req.query.limit as string) || 50,
        skip: parseInt(req.query.skip as string) || 0,
      };

      const query: any = {};
      if (filters.status) {
        query.status = filters.status;
      }

      const total = await EarlyAccessRequest.countDocuments(query);
      const requests = await EarlyAccessRequest.find(query)
        .sort({ createdAt: -1 })
        .limit(filters.limit)
        .skip(filters.skip)
        .lean();

      res.json({
        success: true,
        data: {
          requests,
          total,
          limit: filters.limit,
          skip: filters.skip,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/admin/early-access-requests/:requestId/status
   * Update early access request status
   */
  static async updateEarlyAccessRequestStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const { status } = req.body;

      if (!['pending', 'contacted', 'completed', 'cancelled'].includes(status)) {
        throw new ApiError(400, 'Invalid status value');
      }

      const request = await EarlyAccessRequest.findByIdAndUpdate(
        requestId,
        { status, updatedAt: new Date() },
        { new: true }
      );

      if (!request) {
        throw new ApiError(404, 'Request not found');
      }

      res.json({
        success: true,
        data: request,
        message: `Request status updated to ${status}`,
      });
    } catch (error) {
      next(error);
    }
  }
}
