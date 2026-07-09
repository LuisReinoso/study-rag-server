// Config desde entorno. Todo lo que cambia entre máquinas/modelos vive aquí.

export interface AppConfig {
  port: number;
  llm: {
    provider: string;
    baseUrl: string;
    model: string;
    embedModel: string;
    apiKey?: string;
  };
  store: {
    kind: "pgvector" | "memory";
    databaseUrl?: string;
    dim: number; // dimensión del embedding (depende del modelo, p.ej. 768 nomic-embed-text)
  };
  vaultPath: string;
  chunk: { size: number; overlap: number };
  retrieval: { topK: number };
}

const num = (v: string | undefined, d: number) => (v ? Number(v) : d);

export function loadConfig(env: Record<string, string | undefined> = process.env): AppConfig {
  return {
    port: num(env.PORT, 8787),
    llm: {
      provider: env.LLM_PROVIDER || "openai-compat",
      // Default: llama.cpp `./server`. Para Ollama: http://127.0.0.1:11434
      baseUrl: env.LLM_BASE_URL || "http://127.0.0.1:8080",
      model: env.LLM_MODEL || "local",
      embedModel: env.LLM_EMBED_MODEL || "nomic-embed-text",
      apiKey: env.LLM_API_KEY || undefined,
    },
    store: {
      kind: (env.STORE as "pgvector" | "memory") || "memory",
      databaseUrl: env.DATABASE_URL,
      dim: num(env.EMBED_DIM, 768),
    },
    vaultPath: env.VAULT_PATH || "./vault",
    chunk: { size: num(env.CHUNK_SIZE, 1200), overlap: num(env.CHUNK_OVERLAP, 200) },
    retrieval: { topK: num(env.TOP_K, 5) },
  };
}
