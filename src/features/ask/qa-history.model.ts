// Mongoose schema and model for the QaHistory document (userId, question, answer, sources, timestamps).
import mongoose, { Document, Schema } from "mongoose";

export interface IQaHistory extends Document {
  userId: string;
  question: string;
  answer: string;
  sources: string[];
  confidence: "high" | "medium" | "low";
  latencyMs: number;
  createdAt: Date;
}

const qaHistorySchema = new Schema<IQaHistory>({
  userId: { type: String, required: true, index: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  sources: { type: [String], default: [] },
  confidence: {
    type: String,
    enum: ["high", "medium", "low"],
    required: true,
  },
  latencyMs: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const QaHistoryModel = mongoose.model<IQaHistory>(
  "QaHistory",
  qaHistorySchema
);
