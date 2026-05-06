// Registers all docs-related Express routes (upload, list, delete HR documents) and maps them to docs handlers.
import { Router } from "express";
import { getDocsController } from "./docs.controller.js";
import { asyncHandler } from "../../lib/async-handler.js";

export const docsRouter = Router();

/**
 * @openapi
 * /api/docs:
 *   get:
 *     summary: List all seeded HR documents
 *     tags: [Docs]
 *     responses:
 *       200:
 *         description: List of documents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
docsRouter.get("/", asyncHandler(getDocsController));
