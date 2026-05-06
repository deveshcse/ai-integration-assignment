// Exports a `connectDb` function that establishes a Mongoose connection to MongoDB using the MONGODB_URI env var.
import mongoose from "mongoose";
import { logger } from "../lib/logger.js";

export async function connectDb(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set.");
  }
  await mongoose.connect(uri);
  logger.info("MongoDB connected successfully.");
}
