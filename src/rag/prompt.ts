import type { ChatMessage } from "../llm/provider.js";

export interface Retrieved {
  source: string;
  text: string;
  score?: number;
}

const SYSTEM =
  "You are a study assistant that answers ONLY from the user's own notes given as CONTEXT. " +
  "If the answer is not in the context, say clearly that it's not in the notes. " +
  "Cite the sources you use inline as [n]. Be concise, accurate, and do not invent facts.";

export function buildGroundedMessages(question: string, context: Retrieved[]): ChatMessage[] {
  const ctx = context.map((c, i) => `[${i + 1}] (${c.source})\n${c.text}`).join("\n\n");
  const user = `CONTEXT:\n${ctx || "(no relevant notes found)"}\n\nQUESTION: ${question}`;
  return [
    { role: "system", content: SYSTEM },
    { role: "user", content: user },
  ];
}

export function citations(context: Retrieved[]): Array<{ n: number; source: string }> {
  return context.map((c, i) => ({ n: i + 1, source: c.source }));
}
