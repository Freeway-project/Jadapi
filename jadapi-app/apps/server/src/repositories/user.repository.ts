import { UserModel, User } from "../models/user.model";

export const UserRepository = {
  async create(data: Pick<User, "name" | "email" | "role">) {
    return UserModel.create(data);
  },
  async findById(id: string) {
    return UserModel.findById(id).lean();
  },
  async findByEmail(email: string) {
    return UserModel.findOne({ email }).lean();
  },
  async list(limit = 20, skip = 0) {
    return UserModel.find().sort({ createdAt: -1 }).limit(limit).skip(skip).lean();
  }
};
