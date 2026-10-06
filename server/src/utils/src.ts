/**
 * SM-2 spaced repetition algorithm (same family of algorithm used by Anki).
 *
 * We only have a binary correct/incorrect signal (not the 0-5 quality scale
 * from the original SM-2 paper), so we map:
 *   correct   -> quality 5 (perfect recall)
 *   incorrect -> quality 2 (failed recall)
 *
 * Given the word's current scheduling state and whether the answer was
 * correct, this returns the updated scheduling fields.
 */

export interface SRSState {
    easeFactor: number;
    interval: number;
    repetitions: number;
  }
  
  export interface SRSResult extends SRSState {
    nextReviewDate: Date;
  }
  
  const MIN_EASE_FACTOR = 1.3;
  
  export function calculateNextReview(
    current: SRSState,
    wasCorrect: boolean
  ): SRSResult {
    const quality = wasCorrect ? 5 : 2;
  
    // Update ease factor based on how "easy" the recall was.
    let easeFactor =
      current.easeFactor +
      (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < MIN_EASE_FACTOR) easeFactor = MIN_EASE_FACTOR;
  
    let repetitions: number;
    let interval: number;
  
    if (!wasCorrect) {
      // Wrong answer: reset progress, review again tomorrow.
      repetitions = 0;
      interval = 1;
    } else {
      repetitions = current.repetitions + 1;
  
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 6;
      } else {
        interval = Math.round(current.interval * easeFactor);
      }
    }
  
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  
    return { easeFactor, interval, repetitions, nextReviewDate };
  }