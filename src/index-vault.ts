import { readdir, readFile, stat } from "node:fs/promises";
import { join, extname, relative } from "node:path";
import type { AppConfig } from "./config.js";
import type { LLMProvider } from "./llm/provider.js";
import type { VectorStore } from "./store/vector-store.js";
import { chunkNote, type Chunk } from "./rag/chunk.js";

async function walkMarkdown(dir: string): Promise<string[]> {
  const out: string[] = [];
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    return out;
  }
  for (const name of names) {
    if (name.startsWith(".")) continue;
    const full = join(dir, name);
    const info = await stat(full);
    if (info.isDirectory()) out.push(...(await walkMarkdown(full)));
    else if (extname(name).toLowerCase() === ".md") out.push(full);
  }
  return out;
}

const EMBED_BATCH = 32;

export async function indexVault(
  cfg: AppConfig,
  llm: LLMProvider,
  store: VectorStore
): Promise<{ notes: number; chunks: number }> {
  const files = await walkMarkdown(cfg.vaultPath);

  let all: Chunk[] = [];
  for (const f of files) {
    const text = await readFile(f, "utf8");
    all = all.concat(chunkNote(relative(cfg.vaultPath, f), text, cfg.chunk));
  }

  for (let i = 0; i < all.length; i += EMBED_BATCH) {
    const slice = all.slice(i, i + EMBED_BATCH);
    const embeddings = await llm.embed(slice.map((c) => c.text));
    slice.forEach((c, j) => (c.embedding = embeddings[j]));
  }

  await store.clear();
  await store.upsert(all);
  return { notes: files.length, chunks: all.length };
}
