// Global Express error-handling middleware: catches all errors, logs them, and sends a structured JSON error response.
import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.js";
import { ApiError } from "../lib/api-error.js";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = (err as ApiError).statusCode || 500;
  const message = err.message || "Internal server error";

  // Log the full error details
  logger.error({ err, path: req.path, method: req.method }, message);

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}
