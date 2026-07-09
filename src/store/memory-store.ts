import type { VectorStore, SearchHit } from "./vector-store.js";
import type { Chunk } from "../rag/chunk.js";
import { topK } from "../rag/similarity.js";

export function createMemoryStore(): VectorStore {
  let data: Chunk[] = [];
  return {
    async upsert(chunks: Chunk[]) {
      const ids = new Set(chunks.map((c) => c.id));
      data = data.filter((c) => !ids.has(c.id)).concat(chunks);
    },
    async search(embedding: number[], k: number): Promise<SearchHit[]> {
      return topK(embedding, data, k).map((s) => ({ ...s.item, score: s.score }));
    },
    async clear() {
      data = [];
    },
  };
}
