import { test } from "node:test";
import assert from "node:assert/strict";
import { buildGroundedMessages, citations } from "./prompt.js";

test("buildGroundedMessages: system fuerza grounding, user trae contexto + pregunta", () => {
  const msgs = buildGroundedMessages("What is X?", [{ source: "n1.md", text: "X is Y" }]);
  assert.equal(msgs[0].role, "system");
  assert.ok(msgs[0].content.toLowerCase().includes("only from"));
  assert.equal(msgs[1].role, "user");
  assert.ok(msgs[1].content.includes("X is Y"));
  assert.ok(msgs[1].content.includes("What is X?"));
  assert.ok(msgs[1].content.includes("[1] (n1.md)"));
});

test("buildGroundedMessages: sin contexto lo dice explícito", () => {
  assert.ok(buildGroundedMessages("Q?", [])[1].content.includes("no relevant notes found"));
});

test("citations: mapea n -> source en orden", () => {
  assert.deepEqual(citations([{ source: "a.md", text: "" }, { source: "b.md", text: "" }]), [
    { n: 1, source: "a.md" },
    { n: 2, source: "b.md" },
  ]);
});
