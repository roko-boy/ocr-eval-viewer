export const MODEL_LABELS: Record<string, string> = {
  "gemini-3.5-flash": "Gemini 3.5 Flash",
  "gemini-3.5-flash-lowThinking": "Gemini 3.5 Flash (Low Thinking)",
  "gemini-3.5-flash-minimalThinking": "Gemini 3.5 Flash (Min Thinking)",
  "gemini-3.1-pro-preview": "Gemini 3.1 Pro Prev",
  "gemini-3-flash-preview": "Gemini 3 Flash Prev",
  "claude-opus-4-7": "Opus 4.7",
  "claude-haiku-4-5": "Haiku 4.5",
  "gpt-5.4-mini": "GPT-5.4 mini",
  "gpt-5.5": "GPT-5.5",
};

export function labelFor(model: string): string {
  return MODEL_LABELS[model] ?? model;
}

export const STATUS_STYLES: Record<string, string> = {
  match: "bg-emerald-950 text-emerald-300 border-emerald-800",
  mismatch: "bg-red-950 text-red-300 border-red-800",
  missing: "bg-amber-950 text-amber-300 border-amber-800",
  "no-truth": "bg-neutral-900 text-neutral-600 border-neutral-800",
  unscoreable: "bg-sky-950 text-sky-300 border-sky-800",
};
