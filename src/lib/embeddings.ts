import { pipeline } from "@xenova/transformers";

let extractor: any = null;

export const embeddingsLib = {
  getEmbedding: async (text: string): Promise<number[]> => {
    // Lazy load the extractor
    if (!extractor) {
      extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    }

    const result = await extractor(text, {
      pooling: "mean",
      normalize: true,
    });

    return Array.from(result.data) as number[];
  },
};

export const getEmbedding = (text: string) => embeddingsLib.getEmbedding(text);
