// Zod schemas for validating ask request bodies (question input) and shaping ask responses (answer, sources).
import { z } from "zod";

export const askRequestSchema = z.object({
  question: z.string().min(3).max(500),
});

export const askResponseSchema = z.object({
  answer: z.string(),
  sources: z.array(z.string()),
  confidence: z.enum(["high", "medium", "low"]),
});

export type AskResponse = z.infer<typeof askResponseSchema>;
