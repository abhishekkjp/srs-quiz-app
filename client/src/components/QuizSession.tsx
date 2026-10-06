import { useEffect, useRef, useState } from "react";
import { fetchDueWords, submitReview } from "../api/words";
import type { Word } from "../types/word";
import type { SessionConfig } from "../types/session";

interface Props {
  config: SessionConfig;
  onExit: () => void;
}

interface AnswerFeedback {
  selected: string;
  wasCorrect: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function QuizSession({ config, onExit }: Props) {
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<Word[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(
    config.mode === "time" ? config.value * 60 : null
  );

  const finishedRef = useRef(finished);
  finishedRef.current = finished;

  useEffect(() => {
    fetchDueWords()
      .then((words) => {
        let shuffled = shuffle(words);
        if (config.mode === "count") {
          shuffled = shuffled.slice(0, config.value);
        }
        setQueue(shuffled);
        if (shuffled.length > 0) {
          setOptions(shuffle([shuffled[0].correctMeaning, ...shuffled[0].incorrectOptions]));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (config.mode !== "time") return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          if (!finishedRef.current) setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.mode]);

  const currentWord = queue[0];

  const handleAnswer = async (selected: string) => {
    if (!currentWord || feedback) return;

    const wasCorrect = selected === currentWord.correctMeaning;
    setFeedback({ selected, wasCorrect });
    setScore((s) => ({
      correct: s.correct + (wasCorrect ? 1 : 0),
      incorrect: s.incorrect + (wasCorrect ? 0 : 1),
    }));

    try {
      await submitReview(currentWord._id, wasCorrect);
    } catch (err) {
      console.error("Failed to submit review:", err);
    }
  };

  const handleNext = () => {
    setFeedback(null);

    setQueue((prevQueue) => {
      const [current, ...rest] = prevQueue;
      const nextQueue = feedback?.wasCorrect ? rest : [...rest, current];

      if (nextQueue.length === 0) {
        setFinished(true);
      } else {
        setOptions(shuffle([nextQueue[0].correctMeaning, ...nextQueue[0].incorrectOptions]));
      }

      return nextQueue;
    });
  };

  const handleQuit = () => {
    setFinished(true);
  };

  if (loading) return <p className="empty-state">Loading due words…</p>;

  if (queue.length === 0 && !finished) {
    return (
      <div>
        <p className="empty-state">No words are due for review right now.</p>
        <button className="btn" onClick={onExit} style={{ marginTop: "1rem" }}>
          Back
        </button>
      </div>
    );
  }

  if (finished) {
    const total = score.correct + score.incorrect;
    return (
      <div>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Session complete</h2>
        <p style={{ color: "var(--ink-soft)", marginBottom: "1.5rem" }}>
          {score.correct} / {total} correct
        </p>
        <button className="btn btn-primary" onClick={onExit}>
          Back to home
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="quiz-header">
        <span>
          {score.correct} correct · {score.incorrect} incorrect
        </span>
        <span>{queue.length} remaining</span>
        {timeLeft !== null && <span className="quiz-timer">{formatTime(timeLeft)}</span>}
        <button className="btn btn-text" onClick={handleQuit}>
          Quit
        </button>
      </div>

      <h2 className="quiz-term">{currentWord.term}</h2>
      {currentWord.reading && <p className="quiz-reading">{currentWord.reading}</p>}

      <div className="quiz-options">
        {options.map((opt) => {
          let stateClass = "";
          if (feedback) {
            if (opt === currentWord.correctMeaning) stateClass = "is-correct";
            else if (opt === feedback.selected) stateClass = "is-incorrect";
          }
          return (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={!!feedback}
              className={`btn btn-block quiz-option ${stateClass}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {feedback && (
        <div className="quiz-feedback">
          <span className={`quiz-feedback-text ${feedback.wasCorrect ? "is-correct" : "is-incorrect"}`}>
            {feedback.wasCorrect ? "Correct" : `Incorrect — answer was "${currentWord.correctMeaning}"`}
          </span>
          <button className="btn btn-primary" onClick={handleNext}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}