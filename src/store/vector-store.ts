import type { Chunk } from "../rag/chunk.js";

export type SearchHit = Chunk & { score: number };

export interface VectorStore {
  upsert(chunks: Chunk[]): Promise<void>;
  search(embedding: number[], k: number): Promise<SearchHit[]>;
  clear(): Promise<void>;
  close?(): Promise<void>;
}
