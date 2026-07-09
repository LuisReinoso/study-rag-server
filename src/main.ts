// Punto de entrada: arranca el server.
import { createServer } from "./server.js";

const { app, cfg, llm } = await createServer();
app.listen(cfg.port, () => {
  console.log(`study-rag-server escuchando en :${cfg.port}`);
  console.log(`  LLM:   ${llm.name}`);
  console.log(`  Store: ${cfg.store.kind}`);
  console.log(`  Vault: ${cfg.vaultPath}`);
});
