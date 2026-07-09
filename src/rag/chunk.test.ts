import { test } from "node:test";
import assert from "node:assert/strict";
import { chunkNote } from "./chunk.js";

test("chunkNote: splits into multiple chunks and carries the source", () => {
  const text = Array.from({ length: 6 }, (_, i) => `Paragraph number ${i}. `.repeat(15)).join("\n\n");
  const chunks = chunkNote("note.md", text, { size: 300, overlap: 50 });
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((c) => c.source === "note.md"));
  assert.ok(chunks.every((c) => c.text.length > 0 && c.text.length <= 300));
  assert.equal(chunks[0].id, "note.md#0");
});

test("chunkNote: empty text -> []", () => {
  assert.deepEqual(chunkNote("x.md", "   \n\n  ", { size: 100, overlap: 10 }), []);
});

test("chunkNote: a huge paragraph is hard-split by size", () => {
  const chunks = chunkNote("g.md", "a".repeat(1000), { size: 200, overlap: 20 });
  assert.ok(chunks.length > 3);
  assert.ok(chunks.every((c) => c.text.length <= 200));
});
