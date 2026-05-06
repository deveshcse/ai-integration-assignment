import { Response } from "express";

/**
 * Standardized success response utility.
 */
export function sendSuccess(
  res: Response,
  data: any,
  message = "Success",
  statusCode = 200
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}
