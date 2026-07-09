export interface Chunk {
  id: string;
  source: string;
  text: string;
  embedding?: number[];
}

export interface ChunkOptions {
  size: number;
  overlap: number;
}

// Splits a note into overlapping chunks. The overlap keeps ideas from being cut across
// a boundary, which improves retrieval recall.
export function chunkNote(source: string, text: string, opts: ChunkOptions): Chunk[] {
  const clean = text.replace(/\r\n/g, "\n").trim();
  if (!clean) return [];
  const paras = clean.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  const chunks: string[] = [];
  let buf = "";
  for (const p of paras) {
    if (buf && buf.length + 1 + p.length > opts.size) {
      chunks.push(buf);
      const tail = opts.overlap > 0 ? buf.slice(-opts.overlap) : "";
      buf = tail ? `${tail}\n${p}` : p;
    } else {
      buf = buf ? `${buf}\n${p}` : p;
    }
    while (buf.length > opts.size) {
      chunks.push(buf.slice(0, opts.size));
      buf = buf.slice(opts.size - opts.overlap);
    }
  }
  if (buf.trim()) chunks.push(buf);

  return chunks.map((text, i) => ({ id: `${source}#${i}`, source, text: text.trim() }));
}
