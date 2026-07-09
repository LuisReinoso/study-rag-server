// Fábrica de stores: elige adaptador por config. Añadir otro backend = un case más.

import type { VectorStore } from "./vector-store.js";
import { createMemoryStore } from "./memory-store.js";
import { createPgVectorStore } from "./pgvector-store.js";
import type { AppConfig } from "../config.js";

export async function getStore(cfg: AppConfig["store"]): Promise<VectorStore> {
  if (cfg.kind === "pgvector") {
    if (!cfg.databaseUrl) throw new Error("STORE=pgvector requiere DATABASE_URL");
    return createPgVectorStore({ databaseUrl: cfg.databaseUrl, dim: cfg.dim });
  }
  return createMemoryStore();
}

export type { VectorStore } from "./vector-store.js";
