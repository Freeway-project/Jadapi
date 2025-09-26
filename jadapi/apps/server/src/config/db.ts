import mongoose from "mongoose";
import { ENV } from "./env";

export async function connectDB() {
  if (!ENV.MONGO_URI) throw new Error("MONGO_URI is not set");
  mongoose.set("strictQuery", true);
  await mongoose.connect(ENV.MONGO_URI);
  return mongoose.connection;
}
