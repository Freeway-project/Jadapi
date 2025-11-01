import { ActivityLog } from "../models/ActivityLog";
import { DeliveryOrder } from "../models/DeliveryOrder";
import { User } from "../models/user.model";
import { UserRepository } from "../repositories/user.repository";
import { Types } from "mongoose";
import bcrypt from "bcrypt";

export class AdminService {
  /**
   * Get dashboard statistics
   */
  static async getDashboardStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      totalOrders,
      todayOrders,
      weekOrders,
      monthOrders,
      pendingOrders,
      activeOrders,
      completedOrders,
      todayRevenue,
      weekRevenue,
      monthRevenue,
    ] = await Promise.all([
      User.countDocuments({ status: "active" }),
      User.countDocuments({
        status: "active",
        "auth.lastLoginAt": { $gte: last7Days }
      }),
      DeliveryOrder.countDocuments(),
      DeliveryOrder.countDocuments({ createdAt: { $gte: today } }),
      DeliveryOrder.countDocuments({ createdAt: { $gte: last7Days } }),
      DeliveryOrder.countDocuments({ createdAt: { $gte: last30Days } }),
      DeliveryOrder.countDocuments({ status: "pending" }),
      DeliveryOrder.countDocuments({
        status: { $in: ["assigned", "picked_up", "in_transit"] }
      }),
      DeliveryOrder.countDocuments({ status: "delivered" }),
      this.calculateRevenue(today),
      this.calculateRevenue(last7Days),
      this.calculateRevenue(last30Days),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
      },
      orders: {
        total: totalOrders,
        today: todayOrders,
        week: weekOrders,
        month: monthOrders,
        pending: pendingOrders,
        active: activeOrders,
        completed: completedOrders,
      },
      revenue: {
        today: todayRevenue,
        week: weekRevenue,
        month: monthRevenue,
      },
    };
  }

  /**
   * Calculate revenue for a period
   */
  private static async calculateRevenue(startDate: Date) {
    const result = await DeliveryOrder.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ["delivered", "in_transit", "picked_up"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$pricing.total" },
        },
      },
    ]);

    return result[0]?.total || 0;
  }

  /**
   * Get recent activity logs
   */
  static async getRecentActivity(limit: number = 50, skip: number = 0) {
    const activities = await ActivityLog.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .populate("userId", "profile.name auth.email")
      .lean();

    const total = await ActivityLog.countDocuments();

    return {
      activities,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total,
      },
    };
  }

  /**
   * Get user activity
   */
  static async getUserActivity(userId: string, limit: number = 50) {
    return ActivityLog.find({ userId: new Types.ObjectId(userId) })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Get active orders with details
   */
  static async getActiveOrders(limit: number = 50, skip: number = 0) {
    const orders = await DeliveryOrder.find({
      status: { $in: ["pending", "assigned", "picked_up", "in_transit"] },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate("userId", "profile.name auth.phone")
      .populate("driverId", "profile.name auth.phone")
      .lean();

    const total = await DeliveryOrder.countDocuments({
      status: { $in: ["pending", "assigned", "picked_up", "in_transit"] },
    });

    return {
      orders,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total,
      },
    };
  }

  /**
   * Get all orders with filters
   */
  static async getOrders(filters: {
    status?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    skip?: number;
  }) {
    const { status, userId, startDate, endDate, limit = 50, skip = 0 } = filters;

    const query: any = {};
    if (status) query.status = status;
    if (userId) query.userId = new Types.ObjectId(userId);
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    const orders = await DeliveryOrder.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate("userId", "profile.name auth.phone auth.email")
      .populate("driverId", "profile.name auth.phone")
      .lean();

    const total = await DeliveryOrder.countDocuments(query);

    return {
      orders,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total,
      },
    };
  }

  /**
   * Get all users with filters
   */
  static async getUsers(filters: {
    role?: string;
    status?: string;
    search?: string;
    limit?: number;
    skip?: number;
  }) {
    const { role, status, search, limit = 50, skip = 0 } = filters;

    const query: any = {};
    if (role) query.roles = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { "profile.name": { $regex: search, $options: "i" } },
        { "auth.email": { $regex: search, $options: "i" } },
        { "auth.phone": { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select("-delegation.apiKeys.hash")
      .lean();

    const total = await User.countDocuments(query);

    return {
      users,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total,
      },
    };
  }

  /**
   * Get system metrics
   */
  static async getSystemMetrics() {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      apiCallsLast24h,
      errorRateLast24h,
      avgResponseTime,
    ] = await Promise.all([
      ActivityLog.countDocuments({ timestamp: { $gte: last24Hours } }),
      ActivityLog.countDocuments({
        timestamp: { $gte: last24Hours },
        statusCode: { $gte: 400 },
      }),
      this.calculateAvgResponseTime(last24Hours),
    ]);

    const errorRate = apiCallsLast24h > 0
      ? (errorRateLast24h / apiCallsLast24h) * 100
      : 0;

    return {
      apiCalls24h: apiCallsLast24h,
      errorRate24h: errorRate.toFixed(2),
      avgResponseTime,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
  }

  /**
   * Calculate average response time
   */
  private static async calculateAvgResponseTime(startDate: Date) {
    const result = await ActivityLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          "metadata.duration": { $exists: true },
        },
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: "$metadata.duration" },
        },
      },
    ]);

    return result[0]?.avgDuration?.toFixed(2) || 0;
  }

  /**
   * Create a new driver account
   */
  static async createDriver(driverData: {
    email?: string;
    phone?: string;
    password?: string;
    name: string;
    address?: string;
    vehicleType?: string;
    licenseNumber?: string;
  }) {
    // Validate required fields
    if (!driverData.email && !driverData.phone) {
      throw new Error('Either email or phone is required');
    }

    if (!driverData.name) {
      throw new Error('Name is required');
    }

    if (!driverData.address) {
      throw new Error('Address is required');
    }

    if (!driverData.password) {
      throw new Error('Password is required');
    }

    // Check if driver already exists
    const existingDriver = await User.findOne({
      $or: [
        ...(driverData.email ? [{ 'auth.email': driverData.email.toLowerCase() }] : []),
        ...(driverData.phone ? [{ 'auth.phone': driverData.phone }] : [])
      ]
    });

    if (existingDriver) {
      throw new Error('User with this email or phone already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(driverData.password, 10);

    // Create driver account using UserRepository which handles UUID generation
    const driver = await UserRepository.create({
      accountType: 'individual',
      email: driverData.email?.toLowerCase(),
      phone: driverData.phone,
      password: hashedPassword,
      name: driverData.name,
      address: driverData.address,
      roles: ['driver'],
      status: 'active',
    });

    return driver;
  }

  /**
   * Get all drivers with filters
   */
  static async getDrivers(filters: {
    status?: string;
    search?: string;
    limit?: number;
    skip?: number;
  }) {
    const { status, search, limit = 50, skip = 0 } = filters;

    const query: any = { roles: 'driver' };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { 'profile.name': { $regex: search, $options: 'i' } },
        { 'auth.email': { $regex: search, $options: 'i' } },
        { 'auth.phone': { $regex: search, $options: 'i' } },
      ];
    }

    const drivers = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('-delegation.apiKeys.hash')
      .lean();

    const total = await User.countDocuments(query);

    return {
      drivers,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total,
      },
    };
  }

  /**
   * Update driver status
   */
  static async updateDriverStatus(driverId: string, status: 'active' | 'suspended' | 'deleted') {
    const driver = await User.findOneAndUpdate(
      { _id: new Types.ObjectId(driverId), roles: 'driver' },
      { status },
      { new: true }
    );

    if (!driver) {
      throw new Error('Driver not found');
    }

    return driver;
  }
}
