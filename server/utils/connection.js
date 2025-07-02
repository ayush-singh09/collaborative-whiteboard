import mongoose from "mongoose";
import { MONGODB_CONNECTION_URI } from "./config.js";

export const connectDB = async () => {
  try {
    const connect = await mongoose.connect(MONGODB_CONNECTION_URI);
    console.log(`MongoDB connected`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
  }
};
