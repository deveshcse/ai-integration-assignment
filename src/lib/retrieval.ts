import { HrDocumentModel } from "../features/docs/document.model.js";
import { getEmbedding } from "./embeddings.js";

function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i]! * b[i]!;
  }
  return sum;
}

function magnitude(v: number[]): number {
  return Math.sqrt(v.reduce((acc, x) => acc + x * x, 0));
}

function cosineSimilarity(a: number[], b: number[]): number {
  const mag = magnitude(a) * magnitude(b);
  if (mag === 0) return 0;
  return dotProduct(a, b) / mag;
}

export function deriveConfidence(topScore: number): "high" | "medium" | "low" {
  console.log(`[CONFIDENCE] deriveConfidence() - topScore: ${topScore}`);
  if (topScore >= 0.75) {
    console.log(`[CONFIDENCE] Score ${topScore} >= 0.75 -> confidence: HIGH`);
    return "high";
  }
  if (topScore >= 0.45) {
    console.log(`[CONFIDENCE] Score ${topScore} >= 0.45 -> confidence: MEDIUM`);
    return "medium";
  }
  console.log(`[CONFIDENCE] Score ${topScore} < 0.45 -> confidence: LOW`);
  return "low";
}

export async function retrieveRelevantDocs(question: string, topN: number = 3) {
  console.log(`[CONFIDENCE] retrieveRelevantDocs() - question: "${question}"`);
  const qEmbedding = await getEmbedding(question);
  console.log(`[CONFIDENCE] Question embedding generated, length: ${qEmbedding.length}`);
  let topDocs: Array<{
    doc: {
      _id: unknown;
      title: string;
      content: string;
      tags?: string[];
      embedding?: number[];
    };
    score: number;
  }> = [];

  try {
    const vectorResults = await HrDocumentModel.aggregate([
      {
        $vectorSearch: {
          index: process.env.MONGODB_VECTOR_INDEX_NAME ?? "default",
          path: "embedding",
          queryVector: qEmbedding,
          numCandidates: Math.max(topN * 10, 20),
          limit: topN,
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          content: 1,
          tags: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);

    topDocs = vectorResults.map((result) => ({
      doc: {
        _id: result._id,
        title: result.title,
        content: result.content,
        tags: result.tags,
      },
      score: Number(result.score ?? 0),
    }));
    console.log(`[CONFIDENCE] Vector search returned ${topDocs.length} results from MongoDB`);
  } catch (error) {
    // Fallback keeps local/dev flow working when Atlas vector index is not yet configured.
    console.log(
      `[CONFIDENCE] Vector search unavailable, falling back to in-app cosine scoring. Reason: ${
        error instanceof Error ? error.message : "unknown error"
      }`
    );
    const docs = await HrDocumentModel.find({}).lean();
    console.log(`[CONFIDENCE] Retrieved ${docs.length} total documents from DB for fallback scoring`);

    const scored = docs
      .filter((doc) => doc.embedding && doc.embedding.length > 0)
      .map((doc) => ({
        doc,
        score: cosineSimilarity(qEmbedding, doc.embedding),
      }));
    console.log(`[CONFIDENCE] Computed fallback similarity scores for ${scored.length} documents`);

    scored.sort((a, b) => b.score - a.score);
    topDocs = scored.slice(0, topN);
  }

  console.log(
    `[CONFIDENCE] Top ${topN} results:`,
    topDocs.map((d, i) => `${i + 1}. score=${d.score.toFixed(4)}`).join(", ")
  );
  if (topDocs.length === 0) {
    console.log("[CONFIDENCE] No documents matched because corpus is empty or has no embeddings.");
  } else {
    topDocs.forEach(({ doc, score }, index) => {
      const snippet = doc.content.replace(/\s+/g, " ").slice(0, 180);
      const tags = (doc.tags ?? []).join(", ");
      console.log(
        `[CONFIDENCE] Retrieved Doc ${index + 1}/${topDocs.length} | score=${score.toFixed(4)} | id=${String(doc._id)} | title="${doc.title}" | tags=[${tags}] | snippet="${snippet}..."`
      );
    });
  }

  const topScore = topDocs[0]?.score ?? 0;
  console.log(`[CONFIDENCE] Top score: ${topScore.toFixed(4)}`);
  const confidence = deriveConfidence(topScore);

  const context = topDocs
    .map(
      ({ doc }) =>
        `SOURCE [${String(doc._id)}]: ${doc.title}\n${doc.content}`
    )
    .join("\n\n---\n\n");

  return {
    context,
    confidence,
    topDocs: topDocs.map(d => d.doc),
  };
}
