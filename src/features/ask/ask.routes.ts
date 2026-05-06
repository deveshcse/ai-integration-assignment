// Registers all ask-related Express routes (submit question, get history) and maps them to ask handlers.
import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { askController, getHistoryController } from "./ask.controller.js";
import { asyncHandler } from "../../lib/async-handler.js";
import { askRateLimiter } from "../../middleware/rate-limit.middleware.js";

export const askRouter = Router();

/**
 * @openapi
 * /api/ask:
 *   post:
 *     summary: Ask a question about HR policies
 *     tags: [Ask]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AskRequest'
 *     responses:
 *       200: { description: Success }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 *       429: { description: Too many requests }
 */
askRouter.post(
  "/",
  asyncHandler(authMiddleware),
  askRateLimiter,
  asyncHandler(askController)
);

/**
 * @openapi
 * /api/ask/history:
 *   get:
 *     tags:
 *       - Ask
 *     summary: Get last 10 Q&A pairs for the user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401: { description: Unauthorized }
 */
askRouter.get(
  "/history",
  asyncHandler(authMiddleware),
  asyncHandler(getHistoryController)
);
