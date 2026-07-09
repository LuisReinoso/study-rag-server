// Chunking PURO de una nota. Parte por párrafos y empaqueta hasta ~size caracteres,
// con solape (overlap) para no cortar ideas a la mitad. Sin I/O.

export interface Chunk {
  id: string;
  source: string; // nombre/ruta de la nota
  text: string;
  embedding?: number[];
}

export interface ChunkOptions {
  size: number;
  overlap: number;
}

// Divide el texto de una nota en chunks solapados. `source` se propaga a cada chunk.
export function chunkNote(source: string, text: string, opts: ChunkOptions): Chunk[] {
  const clean = text.replace(/\r\n/g, "\n").trim();
  if (!clean) return [];
  const paras = clean.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  const chunks: string[] = [];
  let buf = "";
  for (const p of paras) {
    if (buf && (buf.length + 1 + p.length) > opts.size) {
      chunks.push(buf);
      // arrancar el siguiente con el solape final del anterior
      const tail = opts.overlap > 0 ? buf.slice(-opts.overlap) : "";
      buf = tail ? `${tail}\n${p}` : p;
    } else {
      buf = buf ? `${buf}\n${p}` : p;
    }
    // un párrafo gigante se parte duro
    while (buf.length > opts.size) {
      chunks.push(buf.slice(0, opts.size));
      buf = buf.slice(opts.size - opts.overlap);
    }
  }
  if (buf.trim()) chunks.push(buf);

  return chunks.map((text, i) => ({ id: `${source}#${i}`, source, text: text.trim() }));
}
