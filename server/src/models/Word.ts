import mongoose, { Schema, Document } from "mongoose";

/**
 * A single flashcard: a kanji/word, its correct meaning, 3 distractors,
 * plus SM-2 spaced repetition scheduling data.
 */
export interface IWord extends Document {
  term: string; // the kanji or word itself, e.g. "食べる" or "resile"
  reading?: string; // optional reading/pronunciation, e.g. "たべる"
  correctMeaning: string; // the correct answer/meaning
  incorrectOptions: [string, string, string]; // exactly 3 distractors
  type: "kanji" | "vocab";

  // SM-2 spaced repetition fields
  easeFactor: number; // starts at 2.5, adjusts based on performance
  interval: number; // days until next review
  repetitions: number; // consecutive correct answers
  nextReviewDate: Date; // when this card is next due
  lastReviewedAt: Date | null;

  createdAt: Date;
}

const WordSchema = new Schema<IWord>({
  term: { type: String, required: true, trim: true },
  reading: { type: String, trim: true },
  correctMeaning: { type: String, required: true, trim: true },
  incorrectOptions: {
    type: [String],
    required: true,
    validate: {
      validator: (arr: string[]) => arr.length === 3,
      message: "incorrectOptions must contain exactly 3 options",
    },
  },
  type: { type: String, enum: ["kanji", "vocab"], required: true },

  easeFactor: { type: Number, default: 2.5 },
  interval: { type: Number, default: 0 },
  repetitions: { type: Number, default: 0 },
  nextReviewDate: { type: Date, default: () => new Date() }, // due immediately when created
  lastReviewedAt: { type: Date, default: null },

  createdAt: { type: Date, default: () => new Date() },
});

export const Word = mongoose.model<IWord>("Word", WordSchema);
