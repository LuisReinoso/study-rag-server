import type { LLMProvider } from "./provider.js";
import { createOpenAICompatProvider } from "./openai-compat.js";
import type { AppConfig } from "../config.js";

export function getProvider(cfg: AppConfig["llm"]): LLMProvider {
  switch (cfg.provider) {
    case "openai-compat":
    default:
      return createOpenAICompatProvider(cfg);
  }
}

export type { LLMProvider, ChatMessage } from "./provider.js";
