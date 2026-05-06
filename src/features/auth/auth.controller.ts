import { Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.schema.js";
import { registerUser, loginUser } from "./auth.service.js";
import { ApiError } from "../../lib/api-error.js";
import { sendSuccess } from "../../lib/api-response.js";

export async function registerController(
  req: Request,
  res: Response
): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError("Validation failed", 400);
  }

  const { email, password } = parsed.data;

  try {
    const result = await registerUser(email, password);
    sendSuccess(res, result, "User registered successfully", 201);
  } catch (err) {
    if (err instanceof Error && err.message === "Email already registered") {
      throw new ApiError(err.message, 409);
    }
    throw err;
  }
}

export async function loginController(
  req: Request,
  res: Response
): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError("Validation failed", 400);
  }

  const { email, password } = parsed.data;

  try {
    const result = await loginUser(email, password);
    sendSuccess(res, result, "Login successful");
  } catch (err) {
    if (err instanceof Error && err.message === "Invalid credentials") {
      throw new ApiError(err.message, 401);
    }
    throw err;
  }
}
