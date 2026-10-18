const key = (id: string) => `os-best-${id}`;

export function best(id: string) {
  try {
    // Token Snake's best predates the cabinet.
    return Number(localStorage.getItem(key(id)) ?? (id === "snake" ? localStorage.getItem("os-snake-best") : 0) ?? 0) || 0;
  } catch {
    return 0;
  }
}

/** Saves if it beats the best; true when it's a new record. */
export function record(id: string, score: number) {
  if (score <= best(id)) return false;
  try {
    localStorage.setItem(key(id), String(score));
  } catch {}
  return true;
}
