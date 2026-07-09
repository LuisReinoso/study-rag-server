import type { AppConfig } from "./config.js";
import type { LLMProvider } from "./llm/provider.js";
import type { VectorStore } from "./store/vector-store.js";
import { buildGroundedMessages, citations, type Retrieved } from "./rag/prompt.js";

export interface AskResult {
  answer: string;
  sources: Array<{ n: number; source: string; score: number }>;
}

export async function ask(
  question: string,
  cfg: AppConfig,
  llm: LLMProvider,
  store: VectorStore
): Promise<AskResult> {
  const [qEmbed] = await llm.embed([question]);
  const hits = await store.search(qEmbed, cfg.retrieval.topK);
  const context: Retrieved[] = hits.map((h) => ({ source: h.source, text: h.text, score: h.score }));

  const answer = await llm.chat(buildGroundedMessages(question, context));
  return {
    answer,
    sources: citations(context).map((c, i) => ({ ...c, score: hits[i]?.score ?? 0 })),
  };
}
