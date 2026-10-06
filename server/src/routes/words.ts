import { Router, Request, Response } from "express";
import { Word } from "../models/Word";
import { calculateNextReview } from "../utils/src";

const router = Router();

// POST /api/words - add a new kanji/word with 1 correct + 3 incorrect options
router.post("/", async (req: Request, res: Response) => {
  try {
    const { term, reading, correctMeaning, incorrectOptions, type } = req.body;

    if (!term || !correctMeaning || !type) {
      return res.status(400).json({
        error: "term, correctMeaning, and type are required",
      });
    }

    if (!Array.isArray(incorrectOptions) || incorrectOptions.length !== 3) {
      return res.status(400).json({
        error: "incorrectOptions must be an array of exactly 3 items",
      });
    }

    if (incorrectOptions.some((opt: string) => !opt || !opt.trim())) {
      return res.status(400).json({
        error: "incorrectOptions cannot contain empty values",
      });
    }

    if (type !== "kanji" && type !== "vocab") {
      return res.status(400).json({
        error: "type must be 'kanji' or 'vocab'",
      });
    }

    const word = await Word.create({
      term,
      reading,
      correctMeaning,
      incorrectOptions,
      type,
    });

    res.status(201).json(word);
  } catch (err) {
    console.error("Error creating word:", err);
    res.status(500).json({ error: "Failed to create word" });
  }
});

// GET /api/words - list all words (newest first)
router.get("/", async (_req: Request, res: Response) => {
  try {
    const words = await Word.find().sort({ createdAt: -1 });
    res.json(words);
  } catch (err) {
    console.error("Error fetching words:", err);
    res.status(500).json({ error: "Failed to fetch words" });
  }
});

// GET /api/words/due - words that are due for review right now
router.get("/due", async (_req: Request, res: Response) => {
  try {
    const dueWords = await Word.find({
      nextReviewDate: { $lte: new Date() },
    }).sort({ nextReviewDate: 1 });
    res.json(dueWords);
  } catch (err) {
    console.error("Error fetching due words:", err);
    res.status(500).json({ error: "Failed to fetch due words" });
  }
});

// POST /api/words/:id/review - submit an answer for a word, updates SRS schedule
router.post("/:id/review", async (req: Request, res: Response) => {
  try {
    const { correct } = req.body;

    if (typeof correct !== "boolean") {
      return res.status(400).json({ error: "'correct' must be a boolean" });
    }

    const word = await Word.findById(req.params.id);
    if (!word) {
      return res.status(404).json({ error: "Word not found" });
    }

    const result = calculateNextReview(
      {
        easeFactor: word.easeFactor,
        interval: word.interval,
        repetitions: word.repetitions,
      },
      correct
    );

    word.easeFactor = result.easeFactor;
    word.interval = result.interval;
    word.repetitions = result.repetitions;
    word.nextReviewDate = result.nextReviewDate;
    word.lastReviewedAt = new Date();

    await word.save();

    res.json(word);
  } catch (err) {
    console.error("Error reviewing word:", err);
    res.status(500).json({ error: "Failed to update word review" });
  }
});









export default router;