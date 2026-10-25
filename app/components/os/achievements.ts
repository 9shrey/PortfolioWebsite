/* Achievements: unlocked once, remembered in localStorage, announced as a
   toast by <Toasts>. */

export const ACHIEVEMENTS = {
  booted: { title: "Power on", desc: "Booted SHREY-OS." },
  "all-projects": { title: "Full audit", desc: "Opened every case file." },
  snake: { title: "Throughput", desc: "Ate 10 tokens in Token Snake." },
  runner: { title: "Above the roof", desc: "Scored 500 in Roofline Runner." },
  breakout: { title: "Cache flush", desc: "Cleared level 1 of Cache Breakout." },
  director: { title: "Director", desc: "Made a trailer in the Cinema." },
  quiz: { title: "Film buff", desc: "Five in a row in the Emoji Movie Quiz." },
  popcorn: { title: "Extra butter", desc: "Found out what the popcorn means." },
  konami: { title: "Konami", desc: "Up up down down left right left right B A." },
  "round-trip": { title: "Round trip", desc: "Went professional and came back." },
  "hire-me": { title: "sudo", desc: "Asked nicely." },
} as const;

export type AchievementId = keyof typeof ACHIEVEMENTS;

const KEY = "os-achievements";
const listeners = new Set<(id: AchievementId) => void>();

export function unlocked(): AchievementId[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function unlock(id: AchievementId) {
  const have = unlocked();
  if (have.includes(id)) return;
  try {
    localStorage.setItem(KEY, JSON.stringify([...have, id]));
  } catch {}
  listeners.forEach((f) => f(id));
}

export function onUnlock(f: (id: AchievementId) => void) {
  listeners.add(f);
  return () => {
    listeners.delete(f);
  };
}

/** Small persisted sets (case files opened, …). */
export function remember(key: string, value: string) {
  try {
    const set = new Set<string>(JSON.parse(localStorage.getItem(key) ?? "[]"));
    set.add(value);
    localStorage.setItem(key, JSON.stringify([...set]));
    return set;
  } catch {
    return new Set([value]);
  }
}
