import { test } from "node:test";
import assert from "node:assert/strict";
import { cosineSimilarity, topK } from "./similarity.js";

test("cosineSimilarity: equal=1, orthogonal=0, opposite=-1", () => {
  assert.ok(Math.abs(cosineSimilarity([1, 0], [1, 0]) - 1) < 1e-9);
  assert.ok(Math.abs(cosineSimilarity([1, 0], [0, 1]) - 0) < 1e-9);
  assert.ok(Math.abs(cosineSimilarity([1, 0], [-1, 0]) + 1) < 1e-9);
});

test("cosineSimilarity: zero vector -> 0 (no NaN)", () => {
  assert.equal(cosineSimilarity([0, 0], [1, 1]), 0);
});

test("topK: sorts by similarity and respects k", () => {
  const items = [
    { id: "a", embedding: [1, 0] },
    { id: "b", embedding: [0, 1] },
    { id: "c", embedding: [0.9, 0.1] },
  ];
  const r = topK([1, 0], items, 2);
  assert.equal(r.length, 2);
  assert.equal(r[0].item.id, "a");
  assert.equal(r[1].item.id, "c");
});

test("topK: skips items without an embedding", () => {
  const r = topK([1, 0], [{ id: "a", embedding: [1, 0] }, { id: "b" }], 5);
  assert.equal(r.length, 1);
});
