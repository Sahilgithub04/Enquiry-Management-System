import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle Mongoose connection buffering timeout
  if (err.message && err.message.includes("buffering timed out")) {
    statusCode = 500;
    message =
      "Database connection timeout: Please verify MONGO_URI in Render environment variables and ensure 0.0.0.0/0 is whitelisted in MongoDB Atlas Network Access.";
  }

  // Handle Mongoose duplicate key error (e.g. unique email)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `A record with that ${field} already exists`;
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val: any) => val.message)
      .join(", ");
  }

  // Handle CastError (invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid format for ${err.path}`;
  }

  // Handle Zod validation errors
  if (err.name === "ZodError") {
    statusCode = 400;
    message = err.errors
      .map((e: any) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
  }

  console.error(`[Error] ${statusCode} - ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
  });
};
