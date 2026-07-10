import { test } from "node:test";
import assert from "node:assert/strict";
import { createOpenAICompatProvider } from "./openai-compat.js";

function mockFetch(urls: string[]) {
  return async (url: any) => {
    urls.push(String(url));
    const body = String(url).includes("/embeddings")
      ? { data: [{ index: 0, embedding: [0.1, 0.2, 0.3] }] }
      : { choices: [{ message: { content: "hi" } }] };
    return { ok: true, json: async () => body, text: async () => "" } as any;
  };
}

test("routes chat to baseUrl and embeddings to embedBaseUrl", async () => {
  const urls: string[] = [];
  const orig = globalThis.fetch;
  globalThis.fetch = mockFetch(urls) as any;
  try {
    const p = createOpenAICompatProvider({
      baseUrl: "http://chat:8898",
      embedBaseUrl: "http://embed:11434",
      model: "ornith",
      embedModel: "nomic",
    });
    await p.chat([{ role: "user", content: "x" }]);
    await p.embed(["a"]);
    assert.ok(urls[0].startsWith("http://chat:8898/v1/chat/completions"), urls[0]);
    assert.ok(urls[1].startsWith("http://embed:11434/v1/embeddings"), urls[1]);
  } finally {
    globalThis.fetch = orig;
  }
});

test("embedBaseUrl defaults to baseUrl when unset", async () => {
  const urls: string[] = [];
  const orig = globalThis.fetch;
  globalThis.fetch = mockFetch(urls) as any;
  try {
    const p = createOpenAICompatProvider({ baseUrl: "http://one:8080", model: "m", embedModel: "e" });
    await p.embed(["a"]);
    assert.ok(urls[0].startsWith("http://one:8080/v1/embeddings"), urls[0]);
  } finally {
    globalThis.fetch = orig;
  }
});

test("embed re-sorts by index when the API returns out of order", async () => {
  const orig = globalThis.fetch;
  globalThis.fetch = (async () => ({
    ok: true,
    text: async () => "",
    json: async () => ({
      data: [
        { index: 1, embedding: [9] },
        { index: 0, embedding: [1] },
      ],
    }),
  })) as any;
  try {
    const p = createOpenAICompatProvider({ baseUrl: "http://x", model: "m", embedModel: "e" });
    const out = await p.embed(["a", "b"]);
    assert.deepEqual(out, [[1], [9]]);
  } finally {
    globalThis.fetch = orig;
  }
});
