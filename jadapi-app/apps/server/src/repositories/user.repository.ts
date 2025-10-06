import { User, UserDoc, generateCustomUUID } from "../models/user.model";
import { Types } from "mongoose";

export interface CreateUserData {
  accountType: "individual" | "business";
  email?: string;
  phone?: string;
  password?: string;
  name?: string;
  address?: string;
  businessName?: string;
  gstNumber?: string;
  roles?: ("customer" | "business" | "driver" | "admin")[];
  status?: "active" | "inactive" | "suspended" | "deleted";
}

export const UserRepository = {
  async create(data: CreateUserData): Promise<UserDoc> {
    // Generate unique UUID with retry logic
    let uuid: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      uuid = generateCustomUUID(data.accountType);
      const existingUser = await User.findOne({ uuid }).lean();
      if (!existingUser) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new Error("Failed to generate unique UUID after multiple attempts");
    }

    const userData: any = {
      uuid: uuid!,
      accountType: data.accountType,
      roles: data.roles || ["customer"],
      status: data.status || "active",
      auth: {
        email: data.email,
        phone: data.phone,
        password: data.password,
      },
      profile: {
        name: data.name!,  // Required field
        address: data.address!,  // Required field
      },
    };

    if (data.accountType === "business") {
      userData.businessProfile = {
        businessName: data.businessName || null,
        gstNumber: data.gstNumber || null,
      };
    }

    return User.create(userData);
  },

  async findById(id: string): Promise<UserDoc | null> {
    return User.findById(id).lean();
  },

  async findByPhoneNumber(phone: string): Promise<UserDoc | null> {
    return User.findOne({ "auth.phone": phone }).lean();
  },
  
  async findByUuid(uuid: string): Promise<UserDoc | null> {
    return User.findOne({ uuid }).lean();
  },

  async findByEmail(email: string): Promise<UserDoc | null> {
    return User.findOne({ "auth.email": email }).lean();
  },

  async findByEmailWithPassword(email: string): Promise<UserDoc | null> {
    return User.findOne({ "auth.email": email }).select('+auth.password').lean();
  },

  async findByPhone(phone: string): Promise<UserDoc | null> {
    return User.findOne({ "auth.phone": phone }).lean();
  },

  async list(limit = 20, skip = 0): Promise<UserDoc[]> {
    return User.find({ status: "active" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();
  },

  async updateVerification(userId: Types.ObjectId, type: "email" | "phone"): Promise<UserDoc | null> {
    const update = type === "email"
      ? { "auth.emailVerifiedAt": new Date() }
      : { "auth.phoneVerifiedAt": new Date() };

    return User.findByIdAndUpdate(userId, update, { new: true }).lean();
  },

  async updateProfile(userId: Types.ObjectId | string, profileData: { name?: string; address?: string; businessName?: string; gstNumber?: string }): Promise<UserDoc | null> {
    const update: any = {};

    if (profileData.name !== undefined) {
      update["profile.name"] = profileData.name;
    }
    if (profileData.address !== undefined) {
      update["profile.address"] = profileData.address;
    }
    if (profileData.businessName !== undefined) {
      update["businessProfile.businessName"] = profileData.businessName;
    }
    if (profileData.gstNumber !== undefined) {
      update["businessProfile.gstNumber"] = profileData.gstNumber;
    }

    return User.findByIdAndUpdate(userId, update, { new: true }).lean();
  }
};
