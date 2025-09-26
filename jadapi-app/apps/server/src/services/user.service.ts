import { UserRepository } from "../repositories/user.repository";
import { ApiError } from "../utils/ApiError";

export const UserService = {
  async register(name: string, email: string, role: "customer" | "business" | "admin" = "customer") {
    const existing = await UserRepository.findByEmail(email);
    if (existing) throw new ApiError(409, "Email already registered");
    return UserRepository.create({ name, email, role });
  },
  get(id: string) {
    return UserRepository.findById(id);
  },
  list(limit?: number, skip?: number) {
    return UserRepository.list(limit, skip);
  }
};
