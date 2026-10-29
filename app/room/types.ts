/** Everything the room shows, gathered on the server (app/room/content.ts) and handed to the client. */

export interface CardContent {
  id: string;
  kind: "project" | "role";
  label: string;
  spec: string;
  shroud: string;
  accent: string;
  title: string;
  /** e.g. "GPU kernels · LLM inference" or "Machine Learning Ops Engineer" */
  area: string;
  years: string;
  blurb: string;
  metrics: { value: string; label: string }[];
  /** Two to three short paragraphs for the projected slide. */
  body: { k: string; v: string }[];
  links: { label: string; href: string }[];
}

export interface PostContent {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  status: string;
}

export interface Goal {
  text: string;
  /** 1-12: the month it's due, drawn on the calendar. */
  due?: number;
  done?: boolean;
}

export interface Book {
  title: string;
  author: string;
  color: string;
  note: string;
  placeholder?: boolean;
}

export interface RoomContent {
  name: string;
  title: string;
  location: string;
  email: string;
  resume: string;
  links: { label: string; href: string; handle: string }[];
  about: { lead: string; paragraphs: string[]; education: string; skills: { group: string; items: string[] }[] };
  cards: CardContent[];
  posts: PostContent[];
  year: number;
  goals: Goal[];
  books: Book[];
}

export interface SceneInfo {
  home: { pos: number[]; look: number[]; fov: number };
  slot: number[];
  bench: number[];
  bulb: number[];
  lens: number[];
  window: { x0: number; x1: number; z0: number; z1: number; back: number };
  cards: string[];
  live: Record<string, { image: string | null; pos: number[]; normal: number[]; size: number[] }>;
}

/** What the visitor is looking at. The hash in the URL mirrors it. */
export type View =
  | { kind: "home" }
  | { kind: "work"; card: string }
  | { kind: "about" }
  | { kind: "writing" }
  | { kind: "contact" }
  | { kind: "year" }
  | { kind: "resume" }
  | { kind: "books"; book?: number };
