import dotenv from "dotenv";
import { connectDB } from "./db";
import { Word } from "./models/Word";
import seedData from "./seedData.json";

dotenv.config();

interface SeedWord {
  term: string;
  reading: string;
  correctMeaning: string;
  incorrectOptions: string[];
  type: "kanji" | "vocab";
}

async function seed() {
  await connectDB();

  const data = seedData as SeedWord[];
  console.log(`Loaded ${data.length} words from seedData.json`);

  let inserted = 0;
  let skipped = 0;

  for (const word of data) {
    // Skip if this exact term already exists, so re-running the seed is safe
    const existing = await Word.findOne({ term: word.term });
    if (existing) {
      skipped++;
      continue;
    }

    await Word.create({
      term: word.term,
      reading: word.reading,
      correctMeaning: word.correctMeaning,
      incorrectOptions: word.incorrectOptions,
      type: word.type,
    });
    inserted++;
  }

  console.log(`Done. Inserted: ${inserted}, Skipped (already existed): ${skipped}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});