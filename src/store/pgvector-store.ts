// Store con pgvector (Postgres). Production-credible y suma el skill de Postgres.
// Se conecta perezosamente; crea la extensión y la tabla si no existen.

import pg from "pg";
import type { VectorStore, SearchHit } from "./vector-store.js";
import type { Chunk } from "../rag/chunk.js";

export interface PgVectorConfig {
  databaseUrl: string;
  dim: number;
  table?: string;
}

const toVector = (e: number[]) => `[${e.join(",")}]`;

export async function createPgVectorStore(cfg: PgVectorConfig): Promise<VectorStore> {
  const table = cfg.table ?? "study_chunks";
  const pool = new pg.Pool({ connectionString: cfg.databaseUrl });
  await pool.query("CREATE EXTENSION IF NOT EXISTS vector");
  await pool.query(
    `CREATE TABLE IF NOT EXISTS ${table} (id text PRIMARY KEY, source text, text text, embedding vector(${cfg.dim}))`
  );

  return {
    async upsert(chunks: Chunk[]) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        for (const c of chunks) {
          await client.query(
            `INSERT INTO ${table}(id,source,text,embedding) VALUES($1,$2,$3,$4)
             ON CONFLICT (id) DO UPDATE SET source=$2, text=$3, embedding=$4`,
            [c.id, c.source, c.text, toVector(c.embedding ?? [])]
          );
        }
        await client.query("COMMIT");
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      } finally {
        client.release();
      }
    },
    async search(embedding: number[], k: number): Promise<SearchHit[]> {
      // 1 - distancia coseno = similaridad
      const r = await pool.query(
        `SELECT id, source, text, 1 - (embedding <=> $1) AS score
         FROM ${table} ORDER BY embedding <=> $1 LIMIT $2`,
        [toVector(embedding), k]
      );
      return r.rows.map((row: any) => ({
        id: row.id,
        source: row.source,
        text: row.text,
        score: Number(row.score),
      }));
    },
    async clear() {
      await pool.query(`DELETE FROM ${table}`);
    },
    async close() {
      await pool.end();
    },
  };
}
