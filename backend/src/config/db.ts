import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI =
      process.env.MONGO_URI ||
      process.env.MONGO_URL ||
      "mongodb://localhost:27017/cloudblitz";
    if (!process.env.MONGO_URI && !process.env.MONGO_URL) {
      console.warn(
        "[MongoDB] Warning: Neither MONGO_URI nor MONGO_URL environment variable is set. Falling back to local default.",
      );
    }
    await mongoose.connect(mongoURI);
    console.log(`[MongoDB] Connected successfully to database`);
  } catch (error) {
    console.error("[MongoDB] Connection error:", error);
  }
};
