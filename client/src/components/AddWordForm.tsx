import { useState } from "react";
import type { FormEvent } from "react";
import { createWord } from "../api/words";
import type { WordType } from "../types/word";

interface Props {
  onWordAdded: () => void;
}

export function AddWordForm({ onWordAdded }: Props) {
  const [term, setTerm] = useState("");
  const [reading, setReading] = useState("");
  const [correctMeaning, setCorrectMeaning] = useState("");
  const [incorrect1, setIncorrect1] = useState("");
  const [incorrect2, setIncorrect2] = useState("");
  const [incorrect3, setIncorrect3] = useState("");
  const [type, setType] = useState<WordType>("vocab");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setTerm("");
    setReading("");
    setCorrectMeaning("");
    setIncorrect1("");
    setIncorrect2("");
    setIncorrect3("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!term.trim() || !correctMeaning.trim()) {
      setError("Term and correct meaning are required.");
      return;
    }

    const incorrectOptions: [string, string, string] = [
      incorrect1.trim(),
      incorrect2.trim(),
      incorrect3.trim(),
    ];

    if (incorrectOptions.some((opt) => !opt)) {
      setError("All 3 incorrect options must be filled in.");
      return;
    }

    setSubmitting(true);
    try {
      await createWord({
        term: term.trim(),
        reading: reading.trim() || undefined,
        correctMeaning: correctMeaning.trim(),
        incorrectOptions,
        type,
      });
      resetForm();
      onWordAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
      <h2 style={{ fontSize: "1.25rem" }}>Add a word</h2>

      <label>
        Type
        <select value={type} onChange={(e) => setType(e.target.value as WordType)}>
          <option value="vocab">Vocab</option>
          <option value="kanji">Kanji</option>
        </select>
      </label>

      <label>
        Term
        <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="食べる" />
      </label>

      <label>
        Reading (optional)
        <input value={reading} onChange={(e) => setReading(e.target.value)} placeholder="たべる" />
      </label>

      <label>
        Correct meaning
        <input value={correctMeaning} onChange={(e) => setCorrectMeaning(e.target.value)} placeholder="to eat" />
      </label>

      <label>
        Incorrect option 1
        <input value={incorrect1} onChange={(e) => setIncorrect1(e.target.value)} />
      </label>
      <label>
        Incorrect option 2
        <input value={incorrect2} onChange={(e) => setIncorrect2(e.target.value)} />
      </label>
      <label>
        Incorrect option 3
        <input value={incorrect3} onChange={(e) => setIncorrect3(e.target.value)} />
      </label>

      {error && <p style={{ color: "var(--incorrect)", fontSize: "0.9rem" }}>{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={submitting} style={{ alignSelf: "flex-start" }}>
        {submitting ? "Adding…" : "Add word"}
      </button>
    </form>
  );
}