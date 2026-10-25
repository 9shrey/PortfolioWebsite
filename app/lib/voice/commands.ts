import { projects } from "@/app/data/projects";
import { site } from "@/app/data/site";

/* The local half of Jev: plain rules that resolve most requests on-device,
   instantly, with no network call. Only what falls through here goes to the
   server-side classifier. */

export const BIO_TEXT = `I'm ${site.name}, an ${site.title.toLowerCase()} in Bengaluru. ${site.tagline}`;

export const HELP_TEXT =
  "I can open any section or project, describe a project, scroll, go back, copy my email, open the resume, or open the terminal. Just ask.";

export const PAGES: { route: string; say: string; words: string[] }[] = [
  { route: "/", say: "Back to the start.", words: ["home", "landing page", "main page", "start over"] },
  { route: "/#work", say: "Here's the work.", words: ["work", "projects", "portfolio"] },
  { route: "/#experience", say: "Here's the experience.", words: ["experience", "career", "work history", "jobs"] },
  { route: "/#about", say: "A bit about me.", words: ["about"] },
  { route: "/writing", say: "Here's the writing.", words: ["writing", "blog", "posts", "notes", "articles"] },
  { route: "/cv", say: "Here's the CV.", words: ["cv", "curriculum"] },
  { route: "/now", say: "Here's what I'm up to now.", words: ["now", "currently"] },
  { route: "/#contact", say: "Let's get you in touch.", words: ["contact"] },
];

export type LocalCommand =
  | { type: "scroll"; dir: "up" | "down" | "top" | "bottom" }
  | { type: "stop" }
  | { type: "silence" }
  | { type: "history"; dir: "back" | "forward" }
  | { type: "navigate"; route: string; say: string }
  | { type: "openProject"; slug: string; title: string }
  | { type: "speakOnly"; say: string }
  | { type: "toggleTerminal"; open: boolean }
  | { type: "copyEmail" }
  | { type: "repeat" }
  | { type: "openResume" }
  | { type: "click"; text: string }
  | { type: "runTerminal"; text: string };

// Tolerant of "open inferbench", "show me the fraud detection project", etc.
export function findProject(t: string) {
  let best: { slug: string; score: number } | null = null;
  for (const p of projects) {
    for (const h of [p.title, p.shortTitle, p.slug.replace(/-/g, " ")]) {
      const words = h.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2);
      const hits = words.filter((w) => t.includes(w)).length;
      if (hits > 0 && (!best || hits > best.score)) best = { slug: p.slug, score: hits };
    }
  }
  return best ? projects.find((p) => p.slug === best.slug) ?? null : null;
}

function findPage(t: string) {
  return PAGES.find((page) => page.words.some((w) => new RegExp(`\\b${w}\\b`).test(t))) ?? null;
}

export function matchLocalCommand(raw: string): LocalCommand | null {
  const t = raw.toLowerCase().trim();
  if (!t) return null;

  if (/\b(stop listening|that'?s all|goodbye|bye|never ?mind)\b/.test(t) || t === "stop") return { type: "stop" };
  if (/\b(be quiet|stop talking|shut up|silence|hush)\b/.test(t)) return { type: "silence" };

  if (/\b(top|beginning|very top)\b/.test(t)) return { type: "scroll", dir: "top" };
  if (/\b(bottom|end of the page|very end|footer)\b/.test(t)) return { type: "scroll", dir: "bottom" };
  if (/\bscroll\b.*\bup\b|\bgo up\b|\bup a bit\b/.test(t)) return { type: "scroll", dir: "up" };
  if (/\bscroll\b.*\bdown\b|\bgo down\b|\bdown a bit\b|\bkeep going\b/.test(t)) return { type: "scroll", dir: "down" };

  if (/\bgo back\b|\bprevious page\b/.test(t)) return { type: "history", dir: "back" };
  if (/\bgo forward\b/.test(t)) return { type: "history", dir: "forward" };

  if (/\b(say that again|repeat that|come again)\b/.test(t)) return { type: "repeat" };
  if (/\bcopy\b.*\b(email|address)\b/.test(t)) return { type: "copyEmail" };
  if (/\b(what can you do|list commands|help me out)\b/.test(t) || t === "help") return { type: "speakOnly", say: HELP_TEXT };
  if (/\b(who are you|what do you do|tell me about yourself|introduce yourself)\b/.test(t)) {
    return { type: "speakOnly", say: BIO_TEXT };
  }

  if (/\bopen\b.*\bterminal\b/.test(t)) return { type: "toggleTerminal", open: true };
  if (/\bclose\b.*\bterminal\b/.test(t)) return { type: "toggleTerminal", open: false };
  const typed = t.match(/\btype\s+(.+)/);
  if (typed) return { type: "runTerminal", text: typed[1].trim() };

  if (/\b(get in touch|reach out|email you|send you an email)\b/.test(t)) {
    return { type: "navigate", route: "/#contact", say: "Here's how to reach me." };
  }
  if (/\bresume\b/.test(t) && /\b(open|show|download|see)\b/.test(t)) return { type: "openResume" };

  if (/\b(tell me about|what is|describe|explain)\b/.test(t)) {
    const p = findProject(t);
    if (p) return { type: "speakOnly", say: `${p.shortTitle}. ${p.blurb} ${p.tldr.result}` };
  }

  if (/\b(open|show me|pull up|go to|take me to|navigate to)\b/.test(t)) {
    const p = findProject(t);
    if (p) return { type: "openProject", slug: p.slug, title: p.shortTitle };
    const page = findPage(t);
    if (page) return { type: "navigate", route: page.route, say: page.say };
  }

  const click = t.match(/\bclick(?: on)?\s+(?:the\s+)?(.+)/);
  if (click) return { type: "click", text: click[1].trim() };

  return null;
}

/** Clicks the first visible link or button whose text matches. */
export function clickByText(text: string): boolean {
  const needle = text.toLowerCase().trim();
  if (!needle) return false;
  const candidates = Array.from(document.querySelectorAll<HTMLElement>("a, button")).filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
  const words = needle.split(/\s+/).filter((w) => w.length > 2);
  const match =
    candidates.find((el) => el.textContent?.trim().toLowerCase() === needle) ??
    candidates.find((el) => el.textContent?.toLowerCase().includes(needle)) ??
    candidates.find((el) => words.length > 0 && words.every((w) => el.textContent?.toLowerCase().includes(w)));
  if (!match) return false;
  match.scrollIntoView({ behavior: "smooth", block: "center" });
  match.click();
  return true;
}

export function doScroll(dir: "up" | "down" | "top" | "bottom") {
  if (dir === "top") return window.scrollTo({ top: 0, behavior: "smooth" });
  if (dir === "bottom") return window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  window.scrollBy({ top: window.innerHeight * 0.85 * (dir === "down" ? 1 : -1), behavior: "smooth" });
}
