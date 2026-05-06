import { Router } from "express";
import { registerController, loginController } from "./auth.controller.js";
import { asyncHandler } from "../../lib/async-handler.js";

export const authRouter = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       201: { description: User registered, content: { application/json: { schema: { type: object, properties: { token: { type: string } } } } } }
 *       400: { description: Validation error }
 *       409: { description: Email already registered }
 */
authRouter.post("/register", asyncHandler(registerController));

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login as an existing user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful, content: { application/json: { schema: { type: object, properties: { token: { type: string } } } } } }
 *       401: { description: Invalid credentials }
 */
authRouter.post("/login", asyncHandler(loginController));
