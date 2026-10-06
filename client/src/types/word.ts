export type WordType = "kanji" | "vocab";

export interface Word {
  _id: string;
  term: string;
  reading?: string;
  correctMeaning: string;
  incorrectOptions: [string, string, string];
  type: WordType;

  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
  lastReviewedAt: string | null;

  createdAt: string;
}

export interface NewWordInput {
  term: string;
  reading?: string;
  correctMeaning: string;
  incorrectOptions: [string, string, string];
  type: WordType;
}