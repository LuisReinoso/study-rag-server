// Adaptador OpenAI-compatible. Cubre de una sola vez:
//   - llama.cpp `./server` (expone /v1/chat/completions y /v1/embeddings con --embedding)
//   - Ollama (endpoints /v1/*)
//   - LM Studio, vLLM, text-generation-webui, y cualquier API OpenAI-compatible remota.
// Para cambiar de origen: edita LLM_BASE_URL / LLM_MODEL / LLM_EMBED_MODEL en .env. Cero código.

import type { ChatMessage, ChatOptions, LLMProvider } from "./provider.js";

export interface OpenAICompatConfig {
  baseUrl: string; // p.ej. http://127.0.0.1:8080 (llama.cpp) o http://127.0.0.1:11434 (ollama)
  model: string;
  embedModel: string;
  apiKey?: string; // opcional; los servidores locales no lo piden
  timeoutMs?: number;
}

export function createOpenAICompatProvider(cfg: OpenAICompatConfig): LLMProvider {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (cfg.apiKey) headers.Authorization = `Bearer ${cfg.apiKey}`;
  const timeoutMs = cfg.timeoutMs ?? 60000;

  async function post(path: string, body: unknown): Promise<any> {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(`${cfg.baseUrl}${path}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`${path} -> ${res.status}: ${(await res.text()).slice(0, 300)}`);
      return res.json();
    } finally {
      clearTimeout(t);
    }
  }

  return {
    name: `openai-compat(${cfg.baseUrl}, ${cfg.model})`,

    async chat(messages: ChatMessage[], opts: ChatOptions = {}) {
      const data = await post("/v1/chat/completions", {
        model: cfg.model,
        messages,
        temperature: opts.temperature ?? 0.2,
        max_tokens: opts.maxTokens ?? 1024,
        stream: false,
      });
      return data.choices?.[0]?.message?.content ?? "";
    },

    async embed(texts: string[]) {
      const data = await post("/v1/embeddings", { model: cfg.embedModel, input: texts });
      // La API devuelve en orden pero por robustez ordenamos por `index`.
      return (data.data as Array<{ index: number; embedding: number[] }>)
        .slice()
        .sort((a, b) => a.index - b.index)
        .map((d) => d.embedding);
    },
  };
}
