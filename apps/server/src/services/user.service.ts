import { UserRepository, CreateUserData } from "../repositories/user.repository";
import { ApiError } from "../utils/ApiError";
import { UserDoc } from "../models/user.model";
import { DeliveryOrder } from "../models/DeliveryOrder";

export interface SignupData {
  accountType: "individual" | "business";
  email?: string;
  phone?: string;
  name?: string;
  address?: string;
  businessName?: string;
  gstNumber?: string;
}

export const UserService = {
  async signup(data: SignupData): Promise<UserDoc> {
    // Validate that at least email or phone is provided
    if (!data.email && !data.phone) {
      throw new ApiError(400, "Either email or phone is required");
    }

    // Check for existing users
    if (data.email) {
      const existingByEmail = await UserRepository.findByEmail(data.email);
      if (existingByEmail) {
        throw new ApiError(409, "Email already registered");
      }
    }

    if (data.phone) {
      const existingByPhone = await UserRepository.findByPhone(data.phone);
      if (existingByPhone) {
        throw new ApiError(409, "Phone number already registered");
      }
    }

    // Set roles based on account type
    const roles: ("business" | "customer" | "driver"  | "admin")[] = data.accountType === "business" ? ["business"] : ["customer"];

    // Create user
    const userData: CreateUserData = {
      accountType: data.accountType,
      email: data.email,
      phone: data.phone,
      name: data.name,
      address: data.address,
      businessName: data.businessName,
      gstNumber: data.gstNumber,
      roles,
    };

    return UserRepository.create(userData);
  },

  async get(id: string): Promise<UserDoc | null> {
    return UserRepository.findById(id);
  },


  async getByUuid(uuid: string): Promise<UserDoc | null> {
    return UserRepository.findByUuid(uuid);
  },

  async list(limit?: number, skip?: number): Promise<UserDoc[]> {
    return UserRepository.list(limit, skip);
  },

  async verifyEmail(userId: string): Promise<UserDoc | null> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return UserRepository.updateVerification(user._id as any, "email");
  },

  async verifyPhone(userId: string): Promise<UserDoc | null> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return UserRepository.updateVerification(user._id as any, "phone");
  },

  async updateProfile(userId: string, profileData: { name?: string; address?: string; businessName?: string; gstNumber?: string }): Promise<UserDoc | null> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return UserRepository.updateProfile(user._id as any, profileData);
  },

  async findByIdentifier(identifier: string): Promise<UserDoc | null> {
    // Try to find by email first
    const userByEmail = await UserRepository.findByEmail(identifier);
    if (userByEmail) {
      return userByEmail;
    }

    // Try to find by phone
    const userByPhone = await UserRepository.findByPhone(identifier);
    return userByPhone;
  },

  async getDashboardData(userId: string) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Fetch user's orders
    const orders = await DeliveryOrder.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Calculate stats
    const totalOrders = await DeliveryOrder.countDocuments({ userId });
    const activeOrders = await DeliveryOrder.countDocuments({
      userId,
      status: { $in: ["pending", "assigned", "picked_up", "in_transit"] }
    });
    const completedOrders = await DeliveryOrder.countDocuments({
      userId,
      status: "delivered"
    });

    // Calculate total spent
    const totalSpentResult = await DeliveryOrder.aggregate([
      { $match: { userId: user._id, status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$pricing.total" } } }
    ]);
    const totalSpent = totalSpentResult[0]?.total || 0;

    return {
      user: {
        uuid: user.uuid,
        name: user.profile?.name,
        email: user.auth?.email,
        phone: user.auth?.phone,
        accountType: user.accountType,
        address: user.profile?.address
      },
      stats: {
        totalOrders,
        activeOrders,
        completedOrders,
        totalSpent
      },
      recentOrders: orders
    };
  }
};
