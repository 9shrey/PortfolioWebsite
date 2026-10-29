import type { Goal } from "../room/types";

/** The year planner on the wall of the room. Each goal is written along the top of the planner
 *  and its due month gets a red dot. Tick one off with `done: true`.
 *
 *  PLACEHOLDERS: Shrey hasn't given the real goals yet. Replace these before publishing. */
export const goalsYear = 2026;

export const goals: Goal[] = [
  { text: "Ship Timeblock 1.0", due: 11 },
  { text: "Publish six posts", due: 12 },
  { text: "A fused Triton kernel, end to end", due: 12 },
  { text: "Land an ML systems role", due: 12 },
];
