import type { NewWordInput, Word } from "../types/word";

export async function fetchWords(): Promise<Word[]> {
  const res = await fetch("/api/words");
  if (!res.ok) throw new Error("Failed to fetch words");
  return res.json();
}

export async function createWord(input: NewWordInput): Promise<Word> {
  const res = await fetch("/api/words", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to create word");
  }

  return res.json();
}



export async function fetchDueWords(): Promise<Word[]> {
  const res = await fetch("/api/words/due");
  if (!res.ok) throw new Error("Failed to fetch due words");
  return res.json();
}

export async function submitReview(wordId: string, correct: boolean): Promise<Word> {
  const res = await fetch(`/api/words/${wordId}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correct }),
  });
  if (!res.ok) throw new Error("Failed to submit review");
  return res.json();
}