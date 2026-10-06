import { useState } from "react";
import type { SessionConfig, SessionMode } from "../types/session";

interface Props {
  onStart: (config: SessionConfig) => void;
  onCancel: () => void;
}

const TIME_PRESETS = [5, 10, 15];
const COUNT_PRESETS = [10, 20, 30];

export function SessionSetup({ onStart, onCancel }: Props) {
  const [mode, setMode] = useState<SessionMode>("count");
  const [value, setValue] = useState<number>(10);

  const presets = mode === "time" ? TIME_PRESETS : COUNT_PRESETS;

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1.25rem" }}>Start a review session</h2>

      <div className="mode-toggle">
        <button
          className={`btn ${mode === "count" ? "is-active" : ""}`}
          onClick={() => {
            setMode("count");
            setValue(COUNT_PRESETS[0]);
          }}
        >
          By word count
        </button>
        <button
          className={`btn ${mode === "time" ? "is-active" : ""}`}
          onClick={() => {
            setMode("time");
            setValue(TIME_PRESETS[0]);
          }}
        >
          By time
        </button>
      </div>

      <p style={{ color: "var(--ink-soft)", marginBottom: "0.6rem" }}>
        {mode === "time" ? "Choose session length:" : "Choose how many words to review:"}
      </p>

      <div className="preset-row">
        {presets.map((p) => (
          <button
            key={p}
            className={`btn ${value === p ? "is-selected" : ""}`}
            onClick={() => setValue(p)}
          >
            {p} {mode === "time" ? "min" : "words"}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.6rem" }}>
        <button className="btn btn-primary" onClick={() => onStart({ mode, value })}>
          Start
        </button>
        <button className="btn btn-text" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}