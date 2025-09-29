import { User, UserDoc } from "../models/user.model";
import { Types } from "mongoose";

export interface CreateUserData {
  accountType: "individual" | "business";
  email?: string;
  phone?: string;
  displayName: string;
  legalName?: string;
  roles?: ("customer" | "business" | "driver" | "dispatcher" | "admin")[];
}

export const UserRepository = {
  async create(data: CreateUserData): Promise<UserDoc> {
    const userData = {
      accountType: data.accountType,
      roles: data.roles || ["customer"],
      auth: {
        email: data.email,
        phone: data.phone,
      },
      profile: {
        displayName: data.displayName,
        legalName: data.legalName,
      },
      addressBook: [],
    };

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
  }
};
