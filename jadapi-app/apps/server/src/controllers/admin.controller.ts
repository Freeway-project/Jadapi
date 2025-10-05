import { Request, Response, NextFunction } from "express";
import { AdminService } from "../services/admin.service";
import { ApiError } from "../utils/ApiError";

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
}
