import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI =
      process.env.MONGO_URI || "mongodb://localhost:27017/cloudblitz";
    if (!process.env.MONGO_URI) {
      console.warn(
        "[MongoDB] Warning: MONGO_URI environment variable is not set. Falling back to local default.",
      );
    }
    await mongoose.connect(mongoURI);
    console.log(`[MongoDB] Connected successfully`);
  } catch (error) {
    console.error("[MongoDB] Connection error:", error);
    // Do not call process.exit(1) to allow HTTP health checks to respond
  }
};
