import type { Goal } from "../room/types";

/** The year planner on the wall of the room. Each goal is written along the top of the planner, and
 *  its date is ringed in red pen on the calendar below. Tick one off with `done: true`. */
export const goalsYear = 2027;

export const goals: Goal[] = [
  { text: "Run a full marathon", date: "2027-02-20", kind: "on" },
  { text: "Down to 10% body fat", date: "2027-04-01", kind: "by" },
  { text: "15 lakh in investments", date: "2027-12-05", kind: "by", note: "2 lakh now" },
];
