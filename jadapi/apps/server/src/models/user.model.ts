import mongoose, { Schema, InferSchemaType } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    role: { type: String, enum: ["customer", "business", "admin"], default: "customer" }
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof UserSchema>;
export const UserModel = mongoose.model<User>("User", UserSchema);
