import books from "@/assets/room/books.json";
import cards from "@/assets/room/cards.json";
import { goals, goalsYear } from "../data/goals";
import { projects } from "../data/projects";
import { roles, education } from "../data/experience";
import { site } from "../data/site";
import { skillGroups } from "../data/skills";
import { listPosts } from "../lib/posts";
import type { CardContent, RoomContent } from "./types";

/** Gathers the room's content on the server from the site's data files. */
export async function roomContent(): Promise<RoomContent> {
  const posts = await listPosts();
  return {
    name: site.name,
    title: site.title,
    location: site.location,
    email: site.email,
    resume: site.resume,
    links: [
      { label: "GitHub", href: site.links.github, handle: "9shrey" },
      { label: "LinkedIn", href: site.links.linkedin, handle: "in/9shrey" },
      { label: "X", href: "https://x.com/9shrey", handle: "@9shrey" },
    ],
    about: {
      lead: `I'm Shrey, a software engineer in ${site.location.split(",")[0]}. ${site.tagline}`,
      paragraphs: [
        site.pitch,
        "Right now I'm an ML Ops engineer at Agneyas Labs, building an internal AutoML platform and a hybrid battery digital twin that pairs an equivalent-circuit model with a learned residual network.",
        "I'm looking for software engineering roles, full stack or backend, ideally where machine learning is part of the product.",
      ],
      education: `${education.degree}, ${education.school}, ${education.from.slice(-4)}–${education.to.slice(-4)} · ${education.grade}`,
      skills: skillGroups.map((g) => ({ group: g.label, items: g.items })),
    },
    cards: workList(),
    bench: cards.cards[0].id,
    posts: posts.map((p) => ({ slug: p.slug, title: p.title, excerpt: p.summary, date: p.date, readingTime: p.readingTime, status: p.draft ? "draft" : "published" })),
    year: goalsYear,
    goals,
    books: books.books,
  };
}

type RackCard = (typeof cards.cards)[number];

/** The terminal's work/ list, read like the résumé: the two jobs, then the projects in the order a hiring
 *  manager should read them (app/data/projects.ts), then what's being built now. A project written up
 *  after the room was baked has no card in the rack; it is on the list all the same, with its slug as id. */
function workList(): CardContent[] {
  const rack = cards.cards;
  const fromRack = (c: RackCard) => ({
    id: c.id, kind: c.kind as CardContent["kind"], label: c.label, spec: c.spec, shroud: c.shroud, accent: c.accent, inRack: true,
  });
  const jobs = rack.filter((c) => c.kind === "role").map((c): CardContent => {
    const r = roles.find((x) => x.company === c.company)!;
    return {
      ...fromRack(c), title: `${r.title}, ${r.company}`, area: r.title, years: `${r.from} – ${r.to}`,
      blurb: r.points[0], metrics: r.metrics ?? [],
      body: r.points.slice(1).map((v, i) => ({ k: i ? "" : "Also", v })), links: [],
    };
  });
  const work = projects.map((p): CardContent => {
    const c = rack.find((x) => x.slug === p.slug);
    return {
      ...(c ? fromRack(c) : { id: p.slug, kind: "project" as const, label: p.shortTitle.toUpperCase(), spec: "", shroud: "", accent: "", inRack: false }),
      title: p.title, area: p.area, years: p.year, blurb: p.blurb, metrics: p.headline,
      body: [{ k: "Problem", v: p.tldr.problem }, { k: "Approach", v: p.tldr.approach }, { k: "Result", v: p.tldr.result }],
      links: [{ label: "Read the case study", href: `/work/${p.slug}` }, ...(p.github ? [{ label: "GitHub", href: p.github }] : [])],
    };
  });
  const building = rack.filter((c) => c.slug === "timeblock").map((c): CardContent => ({
    ...fromRack(c), title: "Timeblock", area: "Desktop app · Tauri 2 + React", years: "2026, in progress",
    blurb: "Plan your day, log what actually happened, and see how it stacks up against your weekly goals. A local-first desktop app: your data is a SQLite file on your machine.",
    metrics: [],
    body: [
      { k: "Plan | Actual", v: "Every planned block shows up as a ghost in the Actual lane until you confirm or skip it, so unconfirmed time never counts as done." },
      { k: "Goals", v: "Weekly targets, at least or at most, measured in time or tasks, with a weekly review of target vs plan vs actual." },
    ],
    links: [{ label: "GitHub", href: "https://github.com/9shrey/timeblock" }, { label: "Website", href: "https://9shrey.github.io/timeblock/" }],
  }));
  return [...jobs, ...work, ...building];
}
