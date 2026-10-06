export type SessionMode = "time" | "count";

export interface SessionConfig {
  mode: SessionMode;
  value: number; // minutes if mode === "time", number of words if mode === "count"
}