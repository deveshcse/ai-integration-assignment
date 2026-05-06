import { QaHistoryModel } from "./qa-history.model.js";
import { chatCompletion } from "../../lib/llm.js";
import { retrieveRelevantDocs } from "../../lib/retrieval.js";
import { hrAssistantPrompt } from "../../lib/prompts.js";
import { AskResponse, askResponseSchema } from "./ask.schema.js";

// ---------------------------------------------------------------------------
// Main service function
// ---------------------------------------------------------------------------

export async function answerQuestion(
  question: string,
  userId: string
): Promise<AskResponse & { latencyMs: number }> {
  const startTime = Date.now();

  // a) Retrieve relevant context
  console.log(`[CONFIDENCE] answerQuestion() - starting confidence calculation pipeline`);
  const { context, confidence } = await retrieveRelevantDocs(question);
  console.log(`[CONFIDENCE] answerQuestion() - retrieved confidence: ${confidence}`);

  // b) Format prompt using LangChain and call LLM
  const formattedMessages = await hrAssistantPrompt.formatMessages({
    context,
    question,
  });

  const systemPrompt = (formattedMessages[0] as any).content;
  const userMessage = (formattedMessages[1] as any).content;
  const llmRaw = await chatCompletion(systemPrompt, userMessage);

  // c) Parse and validate
  const cleaned = llmRaw.replace(/```json|```/g, "").trim();
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("LLM returned non-JSON response");
  }

  const validation = askResponseSchema.safeParse(parsed);
  if (!validation.success) {
    throw new Error("LLM returned invalid response shape");
  }

  const answer = validation.data.answer;
  const sources = validation.data.sources;
  const latencyMs = Date.now() - startTime;
  console.log(`[CONFIDENCE] answerQuestion() - final response confidence: ${confidence}, latency: ${latencyMs}ms`);

  // d) Persist to QaHistory
  await QaHistoryModel.create({
    userId,
    question,
    answer,
    sources,
    confidence,
    latencyMs,
    createdAt: new Date(),
  });

  return { answer, sources, confidence, latencyMs };
}

export async function getHistory(userId: string) {
  return QaHistoryModel.find({ userId }).sort({ createdAt: -1 }).limit(10).lean();
}

