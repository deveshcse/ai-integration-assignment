// Mongoose schema and model for the HrDocument document (title, content chunks, embeddings, uploadedBy, timestamps).
import mongoose, { Document, Schema } from "mongoose";

export interface IHrDocument extends Document {
  title: string;
  content: string;
  tags: string[];
  embedding: number[];
  createdAt: Date;
}

const documentSchema = new Schema<IHrDocument>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: { type: [String], default: [] },
  embedding: { type: [Number], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export const HrDocumentModel = mongoose.model<IHrDocument>(
  "HrDocument",
  documentSchema
);
