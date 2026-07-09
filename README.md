# study-rag-server

> **Part of the Study Framework** — the "ask your vault" piece. The other components
> (speed-reading, spaced-repetition, quiz, and `claude-study-server` for generation) turn a
> single note into study material. This one lets you **ask questions across your whole Obsidian
> vault** and get answers grounded ONLY in your notes, with citations back to the source note.

Self-hosted RAG (retrieval-augmented generation). **Open models only** — talks to whatever local
LLM server you run (llama.cpp, Ollama, LM Studio, vLLM) through the OpenAI-compatible API. No API
keys, no vendor lock-in.

## Diseño: nada atado a un modelo ni a un store

El backend LLM cambia seguido (Claude SDK → Ollama → llama.cpp...). Por eso la lógica **no** conoce
un proveedor concreto: programa contra dos interfaces y cada backend es un adaptador delgado.

- **`LLMProvider`** (`src/llm/provider.ts`): `chat()` + `embed()`. El adaptador
  `openai-compat` cubre llama.cpp / Ollama / LM Studio / vLLM. **Cambiar de modelo u origen =
  editar `LLM_BASE_URL` / `LLM_MODEL` en `.env`. Cero código.** Un backend no-compatible = un
  adaptador nuevo que implemente la interfaz.
- **`VectorStore`** (`src/store/vector-store.ts`): `upsert()` + `search()`. Adaptadores:
  `memory` (cero infra, para dev/tests) y `pgvector` (Postgres, production).

La lógica del RAG (chunking, similaridad, prompt grounded) es **pura y testeada**
(`src/rag/*.ts`, tests con `node:test`). El I/O (HTTP, fs, DB) es delgado y sin lógica.

## Quickstart

```bash
pnpm install
cp .env.example .env            # apunta VAULT_PATH a tus notas y LLM_BASE_URL a tu server local
pnpm test                       # corre los tests de la lógica pura
pnpm dev                        # levanta el server (o: pnpm build && pnpm start)

curl -X POST localhost:8787/api/index                              # indexa el vault
curl -X POST localhost:8787/api/ask -H 'content-type: application/json' \
     -d '{"question":"¿Qué dicen mis notas sobre retrieval practice?"}'
```

## Endpoints

| Método | Ruta | Qué hace |
|---|---|---|
| `GET`  | `/health`    | estado (qué LLM y store hay detrás) |
| `POST` | `/api/index` | trocea el vault, lo embebe y lo guarda en el store |
| `POST` | `/api/ask`   | `{ question }` → `{ answer, sources[] }` con citas a tus notas |

## Correr con distintos modelos (sin tocar código)

```
# llama.cpp
LLM_BASE_URL=http://127.0.0.1:8080   LLM_MODEL=local

# Ollama
LLM_BASE_URL=http://127.0.0.1:11434  LLM_MODEL=llama3.1  LLM_EMBED_MODEL=nomic-embed-text
```

## Estructura

```
src/
  llm/     provider.ts (interfaz) · openai-compat.ts (adaptador) · index.ts (fábrica)
  store/   vector-store.ts (interfaz) · memory-store.ts · pgvector-store.ts · index.ts
  rag/     chunk.ts · similarity.ts · prompt.ts  (+ *.test.ts, lógica pura)
  index-vault.ts · ask.ts · server.ts · main.ts   (I/O y ensamblado)
```
