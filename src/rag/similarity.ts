export function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export function norm(a: number[]): number {
  return Math.sqrt(dot(a, a));
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const d = norm(a) * norm(b);
  return d === 0 ? 0 : dot(a, b) / d;
}

export interface Scored<T> {
  item: T;
  score: number;
}

export function topK<T extends { embedding?: number[] }>(
  query: number[],
  items: T[],
  k: number
): Scored<T>[] {
  return items
    .filter((it) => Array.isArray(it.embedding) && it.embedding.length > 0)
    .map((it) => ({ item: it, score: cosineSimilarity(query, it.embedding as number[]) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
