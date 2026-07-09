// I/O: Express. Solo endpoints delgados que llaman a la lógica ya ensamblada.
//   POST /api/index  -> reindexa el vault
//   POST /api/ask    -> { question } -> { answer, sources }
//   GET  /health     -> estado (qué LLM y store hay detrás)

import express from "express";
import cors from "cors";
import { loadConfig } from "./config.js";
import { getProvider } from "./llm/index.js";
import { getStore } from "./store/index.js";
import { indexVault } from "./index-vault.js";
import { ask } from "./ask.js";

export async function createServer() {
  const cfg = loadConfig();
  const llm = getProvider(cfg.llm);
  const store = await getStore(cfg.store);

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => res.json({ ok: true, llm: llm.name, store: cfg.store.kind }));

  app.post("/api/index", async (_req, res) => {
    try {
      res.json(await indexVault(cfg, llm, store));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/ask", async (req, res) => {
    const question = String(req.body?.question ?? "").trim();
    if (!question) return res.status(400).json({ error: "question requerido" });
    try {
      res.json(await ask(question, cfg, llm, store));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  return { app, cfg, llm, store };
}
