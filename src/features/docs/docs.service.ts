// Business logic for docs: parsing uploaded files, chunking text, generating embeddings, storing HrDocuments in MongoDB.
import { HrDocumentModel } from "./document.model.js";

export async function getAllDocs() {
  return HrDocumentModel.find({}, { embedding: 0 }).lean();
}
