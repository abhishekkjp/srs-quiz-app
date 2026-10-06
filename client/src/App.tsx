import { useEffect, useState } from "react";
import { AddWordForm } from "./components/AddWordForm";
import { QuizSession } from "./components/QuizSession";
import { SessionSetup } from "./components/SessionSetup";
import { fetchWords } from "./api/words";
import type { Word } from "./types/word";
import type { SessionConfig } from "./types/session";

type View = "home" | "setup" | "quiz";

function App() {
  const [view, setView] = useState<View>("home");
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWords = () => {
    setLoading(true);
    fetchWords()
      .then(setWords)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWords();
  }, []);

  const handleExitQuiz = () => {
    setView("home");
    setSessionConfig(null);
    loadWords();
  };

  if (view === "setup") {
    return (
      <div className="app-shell">
        <SessionSetup
          onStart={(config) => {
            setSessionConfig(config);
            setView("quiz");
          }}
          onCancel={() => setView("home")}
        />
      </div>
    );
  }

  if (view === "quiz" && sessionConfig) {
    return (
      <div className="app-shell">
        <QuizSession config={sessionConfig} onExit={handleExitQuiz} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <h1 className="app-title">日本語 練習</h1>

      <button className="btn btn-primary" onClick={() => setView("setup")}>
        Start review session
      </button>

      <hr className="divider" />

      <AddWordForm onWordAdded={loadWords} />

      <hr className="divider" />

      <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
        Your words ({words.length})
      </h2>
      {loading ? (
        <p className="empty-state">Loading…</p>
      ) : (
        <ul className="word-list">
          {words.map((w) => (
            <li key={w._id}>
              <span>
                <span className="word-term">{w.term}</span>
                {w.reading ? ` (${w.reading})` : ""} — {w.correctMeaning}
              </span>
              <span className="word-meta">{w.type}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;