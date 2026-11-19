/* The days the city outside marks, by the visitor's own clock: fireworks at New Year and on the
   evenings around Diwali, and snow instead of rain through the deepest weeks of a New York winter.
   `?sky=snow|newyear|diwali|rain` on the room's URL shows one any day, to see what it looks like. */

/** Diwali's main day (Lakshmi Puja) by the Delhi panchang, as [month, day]. Elsewhere it can fall a day
 *  earlier, so the evening before and the evening after have fireworks too. Add years as they come. */
const DIWALI: Record<number, [number, number]> = {
  2026: [11, 8], 2027: [10, 29], 2028: [10, 17], 2029: [11, 5], 2030: [10, 26],
};

export interface Sky {
  fireworks: null | "newyear" | "diwali";
  snow: boolean;
}

const DAY = 86400000;
const midnight = (y: number, m: number, d: number) => new Date(y, m - 1, d).getTime();

export function occasion(now = new Date(), override?: string | null): Sky {
  if (override === "snow") return { fireworks: null, snow: true };
  if (override === "rain") return { fireworks: null, snow: false };
  if (override === "newyear" || override === "diwali") return { fireworks: override, snow: override === "newyear" };
  const y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate(), h = now.getHours();
  // the last five minutes of the year and the first hour of the next
  const newyear = (m === 12 && d === 31 && h === 23 && now.getMinutes() >= 55) || (m === 1 && d === 1 && h === 0);
  const dw = DIWALI[y];
  const sinceDiwali = dw ? Math.round((midnight(y, m, d) - midnight(y, dw[0], dw[1])) / DAY) : 99;
  const diwali = Math.abs(sinceDiwali) <= 1 && h >= 18;
  // 20 December to 10 January
  const snow = (m === 12 && d >= 20) || (m === 1 && d <= 10);
  return { fireworks: newyear ? "newyear" : diwali ? "diwali" : null, snow };
}
