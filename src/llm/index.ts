// Fábrica de proveedores. Selecciona el adaptador por config. Añadir un backend
// no-OpenAI-compatible = un `case` nuevo + su adaptador; el resto del código no cambia.

import type { LLMProvider } from "./provider.js";
import { createOpenAICompatProvider } from "./openai-compat.js";
import type { AppConfig } from "../config.js";

export function getProvider(cfg: AppConfig["llm"]): LLMProvider {
  switch (cfg.provider) {
    // llama.cpp, ollama, lm-studio, vllm, o cualquier API OpenAI-compatible.
    case "openai-compat":
    default:
      return createOpenAICompatProvider(cfg);
  }
}

export type { LLMProvider, ChatMessage } from "./provider.js";
