import { Request, Response } from "express";
import { logger } from "../../lib/logger.js";
import { askRequestSchema } from "./ask.schema.js";
import { answerQuestion, getHistory } from "./ask.service.js";
import { ApiError } from "../../lib/api-error.js";
import { sendSuccess } from "../../lib/api-response.js";

export async function askController(
  req: Request,
  res: Response
): Promise<void> {
  const parsed = askRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError("Validation failed", 400);
  }

  const { question } = parsed.data;
  const userId = req.user!.id;

  const result = await answerQuestion(question, userId);
  const { answer, sources, confidence, latencyMs } = result;

  logger.info(
    { userId, question: question.slice(0, 80), latencyMs, confidence },
    "ask request completed"
  );

  sendSuccess(res, { answer, sources, confidence }, "Question answered successfully");
}

export async function getHistoryController(
  req: Request,
  req_res: Response
): Promise<void> {
  const userId = req.user!.id;
  const history = await getHistory(userId);
  sendSuccess(req_res, history, "History retrieved successfully");
}
