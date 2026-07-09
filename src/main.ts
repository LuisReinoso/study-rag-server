import { createServer } from "./server.js";

const { app, cfg, llm } = await createServer();
app.listen(cfg.port, () => {
  console.log(`study-rag-server listening on :${cfg.port}`);
  console.log(`  LLM:   ${llm.name}`);
  console.log(`  Store: ${cfg.store.kind}`);
  console.log(`  Vault: ${cfg.vaultPath}`);
});
