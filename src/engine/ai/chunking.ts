export function chunkText(text: string, options: { chunkSize?: number; overlap?: number } = {}): string[] {
  const { chunkSize = 500, overlap = 50 } = options;
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (words.length === 0) return [];

  const chunks: string[] = [];
  let start = 0;
  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    chunks.push(words.slice(start, end).join(" "));
    if (end === words.length) break;
    start += chunkSize - overlap;
  }
  return chunks;
}
