import type { RoomContent } from "../types";
import type { Drawn, Region } from "./cards";
import { fonts } from "./surfaces";

/* The old monitor's terminal: amber phosphor, VT323, 48 columns by 18 rows on a 4:3 tube. It boots the
   first time you sit at it, then shows a menu: about.txt (a pager, like `less`), work/ (the projects, each
   with a page of its own), writing/ (the posts;
   each opens as its own page), online, and the résumé. Keys you type go to it (the desk keyboard presses
   them too); the lines you can click are regions the engine maps clicks onto. */

export type TermPage = "boot" | "menu" | "about" | "work" | "project" | "writing" | "online";

interface Line { text: string; kind?: "h" | "dim" | "link" | "big" | "gap"; action?: string }

const COLS = 48, ROWS = 18;
const W = 1024, H = 768;
const AMBER = "#ffb54a", DIM = "#a8702e", DARK = "#130b03", BG = "#0d0803";

export class Terminal {
  canvas = document.createElement("canvas");
  page: TermPage = "menu";
  /** the project open on the "project" page */
  card = "";
  private scroll = 0;
  private sel = 0;
  private booted = false;
  private bootAt = 0;
  private regionsNow: Region[] = [];
  dirty = true;

  constructor(private c: RoomContent, private act: (action: string) => void) {
    this.canvas.width = W; this.canvas.height = H;
  }

  /** Power on: the first time, the BIOS lines run before the menu. */
  boot(now: number) {
    if (this.booted) return;
    this.booted = true; this.page = "boot"; this.bootAt = now; this.dirty = true;
  }

  /** Opens a project's page (or the work/ list when the id is empty). */
  open(id: string) {
    if (!id) return this.go("work");
    this.card = id; this.go("project");
  }
  private step(dir: 1 | -1) {
    const cs = this.c.cards, i = cs.findIndex((c) => c.id === this.card);
    this.open(cs[(i + dir + cs.length) % cs.length].id);
  }

  go(p: TermPage) {
    if (this.page === "boot") this.bootAt = -99;
    this.page = p; this.scroll = 0; this.sel = 0; this.dirty = true;
  }

  // ------------------------------------------------------------------ input
  key(e: KeyboardEvent): boolean {
    const k = e.key;
    if (this.page === "boot") { this.go("menu"); return true; }
    const links = this.lines().filter((l) => l.action);
    const pager = this.pager();
    if (this.page === "project" && (k === "n" || k === "N" || k === "ArrowRight")) return this.step(1), true;
    if (this.page === "project" && (k === "p" || k === "P" || k === "ArrowLeft")) return this.step(-1), true;
    if (k === "1") return this.go("about"), true;
    if (k === "2") return this.go("work"), true;
    if (k === "3") return this.go("writing"), true;
    if (k === "4") return this.go("online"), true;
    if (k === "5" && this.page === "menu") return this.act(`ext:${this.c.resume}`), true;
    if (k === "q" || k === "Q" || k === "Backspace") return this.go(this.page === "project" ? "work" : "menu"), true;
    if (k === "ArrowDown" || k === "j") { if (pager) this.scrollBy(1); else this.sel = Math.min(links.length - 1, this.sel + 1); this.dirty = true; return true; }
    if (k === "ArrowUp" || k === "k") { if (pager) this.scrollBy(-1); else this.sel = Math.max(0, this.sel - 1); this.dirty = true; return true; }
    if (k === " " || k === "PageDown") { this.scrollBy(ROWS - 4); return true; }
    if (k === "PageUp") { this.scrollBy(-(ROWS - 4)); return true; }
    if (k === "Enter" && links[this.sel]?.action) { this.act(links[this.sel].action!); return true; }
    if ((k === "c" || k === "C") && this.page === "online") { this.act(`copy:${this.c.email}`); return true; }
    return false;
  }
  wheel(dy: number) { this.scrollBy(Math.sign(dy) * 2); }
  private scrollBy(n: number) {
    const max = Math.max(0, this.wrapped().length - (ROWS - 3));
    this.scroll = Math.max(0, Math.min(max, this.scroll + n)); this.dirty = true;
  }
  private pager() { return this.page === "about" || this.page === "project"; }

  // ------------------------------------------------------------------ content
  private lines(): Line[] {
    const c = this.c;
    const date = (d: string) => new Date(d).toISOString().slice(0, 10);
    switch (this.page) {
      case "boot": case "menu": return [
        { text: "", kind: "gap" },
        { text: c.name.toUpperCase(), kind: "big" },
        { text: "", kind: "gap" },
        { text: `${c.title}. ${c.location.split(",")[0]}.`, kind: "dim" },
        { text: "", kind: "gap" },
        { text: "[1] about.txt", kind: "link", action: "term:about" },
        { text: `[2] work/             ${c.cards.length} projects`, kind: "link", action: "term:work" },
        { text: `[3] writing/          ${c.posts.length} posts`, kind: "link", action: "term:writing" },
        { text: "[4] online", kind: "link", action: "term:online" },
        { text: "[5] resume.pdf", kind: "link", action: `ext:${c.resume}` },
        { text: "", kind: "gap" },
        { text: "Type a number, or click.", kind: "dim" },
      ];
      case "about": return [
        { text: c.about.lead, kind: "h" }, { text: "", kind: "gap" },
        ...c.about.paragraphs.flatMap((p) => [{ text: p }, { text: "", kind: "gap" as const }]),
        { text: "Education", kind: "h" }, { text: c.about.education, kind: "dim" }, { text: "", kind: "gap" },
        { text: "Tools", kind: "h" },
        ...c.about.skills.map((s) => ({ text: `${s.group}: ${s.items.join(", ")}`, kind: "dim" as const })),
      ];
      case "work": return [
        { text: "What I have built. Or slot a card from the rack on the bench.", kind: "dim" },
        { text: "", kind: "gap" },
        ...c.cards.flatMap((k) => [
          { text: `${k.label.padEnd(18)} ${k.years}`, kind: "link" as const, action: `work:${k.id}` },
          { text: `   ${k.area}`, kind: "dim" as const },
        ]),
      ];
      case "project": {
        const k = c.cards.find((x) => x.id === this.card) ?? c.cards[0];
        return [
          { text: k.title, kind: "h" },
          { text: `${k.area}, ${k.years}`, kind: "dim" },
          { text: "", kind: "gap" },
          { text: k.blurb },
          { text: "", kind: "gap" },
          ...k.metrics.map((m) => ({ text: `${m.value.padEnd(10)} ${m.label}`, kind: "h" as const })),
          ...(k.metrics.length ? [{ text: "", kind: "gap" as const }] : []),
          ...k.body.flatMap((b) => [{ text: b.k, kind: "h" as const }, { text: b.v }, { text: "", kind: "gap" as const }]),
          ...k.links.map((l) => ({ text: `-> ${l.href.startsWith("/") ? "Read the case study" : l.label}`, kind: "link" as const,
            action: l.href.startsWith("http") ? `ext:${l.href}` : `href:${l.href}` })),
          { text: "", kind: "gap" },
          { text: "<- previous project", kind: "link", action: "card:prev" },
          { text: "-> next project", kind: "link", action: "card:next" },
        ];
      }
      case "writing": return [
        { text: "Notes from the projects: what I measured, and what fooled me first.", kind: "dim" },
        { text: "", kind: "gap" },
        ...c.posts.flatMap((p) => [
          { text: `${date(p.date)}  ${p.title}`, kind: "link" as const, action: `href:/writing/${p.slug}` },
          { text: `            ${p.readingTime}. ${p.excerpt}`, kind: "dim" as const },
          { text: "", kind: "gap" as const },
        ]),
        { text: "All of them, as pages", kind: "link", action: "href:/writing" },
      ];
      case "online": return [
        { text: "Email is fastest. I answer everything that", kind: "dim" },
        { text: "isn't a sales pitch.", kind: "dim" },
        { text: "", kind: "gap" },
        { text: `email     ${c.email}`, kind: "link", action: `ext:mailto:${c.email}` },
        ...c.links.map((l) => ({ text: `${l.label.toLowerCase().padEnd(9)} ${l.handle}`, kind: "link" as const, action: `ext:${l.href}` })),
        { text: "resume    one page, PDF", kind: "link", action: `ext:${c.resume}` },
        { text: "", kind: "gap" },
        { text: "[c] copy the email address", kind: "dim" },
      ];
    }
  }

  /** The page's lines broken to the screen's width (links keep their action on their first row). */
  private wrapped(): Line[] {
    const out: Line[] = [];
    for (const l of this.lines()) {
      if (l.kind === "big" || l.kind === "gap" || l.text.length <= COLS - 2) { out.push(l); continue; }
      const words = l.text.split(" "); let cur = "";
      for (const w of words) {
        if ((cur + " " + w).trim().length > COLS - 2) { out.push({ ...l, text: cur, action: out.length && cur ? l.action : l.action }); cur = w; }
        else cur = (cur + " " + w).trim();
      }
      if (cur) out.push({ ...l, text: cur });
    }
    return out;
  }

  // ------------------------------------------------------------------ drawing
  /** Draws if something changed (or the boot is running); returns whether it did. */
  draw(now: number): boolean {
    const booting = this.page === "boot";
    if (!this.dirty && !booting) return false;
    this.dirty = false;
    const g = this.canvas.getContext("2d")!, F = fonts();
    const cw = W / (COLS + 2), lh = H / (ROWS + 2.6), fs = Math.round(lh * 1.1);
    const x0 = cw * 1.6, y = (row: number) => lh * (row + 0.62) + lh * 1.25;
    g.fillStyle = BG; g.fillRect(0, 0, W, H);
    g.font = `${fs}px ${F.pixel}`; g.textBaseline = "alphabetic";
    g.shadowColor = AMBER; g.shadowBlur = 10;
    const regions: Region[] = [];

    const bar = (row: number, left: string, right: string) => {
      g.shadowBlur = 0; g.fillStyle = AMBER; g.fillRect(x0 * 0.5, y(row) - lh * 0.82, W - x0, lh);
      g.fillStyle = DARK; g.fillText(left, x0, y(row)); g.textAlign = "right"; g.fillText(right, W - x0 * 1.7, y(row)); g.textAlign = "left";
      g.shadowBlur = 10;
    };

    if (booting) {
      const t = now - this.bootAt;
      const boot = ["SS-26 BIOS v2.6   (C) 2026 Shrey Singh", "", "CPU  i7-9750H ............................. OK", "GPU  GTX 1650, 4 GB ....................... OK",
        "MEM  16384 MB ............................. OK", "", "Loading SHREY.SYS", "Mounting /writing ......................... 2", "", "Ready."];
      const n = Math.min(boot.length, Math.floor(t / 0.13));
      g.fillStyle = AMBER;
      boot.slice(0, n).forEach((l, i) => g.fillText(l, x0, y(i + 1)));
      if (Math.floor(t * 3) % 2 === 0) g.fillRect(x0, y(n + 1) - lh * 0.7, cw * 0.9, lh * 0.8);   // the cursor
      if (t > boot.length * 0.13 + 0.5) { this.page = "menu"; this.dirty = true; }
      this.regionsNow = [];
      return true;
    }

    const proj = this.c.cards.find((x) => x.id === this.card);
    const names: Record<TermPage, string> = { boot: "", menu: "SS-26", about: "about.txt", work: "work/", project: `work/${proj?.id ?? ""}`, writing: "writing/", online: "online" };
    const rows = this.wrapped();
    const body = ROWS - 3;
    const pager = this.pager();
    const pct = rows.length <= body ? 100 : Math.round(((this.scroll + body) / rows.length) * 100);
    const clock = new Date().toTimeString().slice(0, 5);
    bar(0, ` ${names[this.page]}`, pager ? `${Math.min(100, pct)}%  ${this.scroll + 1}-${Math.min(rows.length, this.scroll + body)}/${rows.length} ` : `${clock} `);

    let li = 0;   // which link this is, for the keyboard selection
    const visible = pager ? rows.slice(this.scroll, this.scroll + body) : rows.slice(0, body);
    // links before the visible window still count for the selection index
    if (pager) li = rows.slice(0, this.scroll).filter((r) => r.action).length;
    visible.forEach((r, i) => {
      const row = i + 2;
      if (r.kind === "big") {
        g.save(); g.font = `${fs * 2}px ${F.pixel}`; g.fillStyle = AMBER; g.fillText(r.text, x0, y(row + 0.6)); g.restore();
        return;
      }
      const isLink = !!r.action, on = isLink && li === this.sel && !pager;
      if (on) { g.shadowBlur = 0; g.fillStyle = AMBER; g.fillRect(x0 - cw * 0.4, y(row) - lh * 0.8, W - x0 * 2 + cw * 0.8, lh * 0.98); g.shadowBlur = 10; }
      g.fillStyle = on ? DARK : r.kind === "dim" ? DIM : AMBER;
      g.fillText(r.text, x0, y(row));
      if (isLink && !on) { g.fillRect(x0, y(row) + 4, g.measureText(r.text).width, 2); }
      if (isLink) { regions.push({ x: 0, y: y(row) - lh * 0.82, w: W, h: lh, action: r.action!, label: r.text }); li++; }
    });
    const hints: Record<TermPage, string> = {
      boot: "", menu: " 1-5 open   Q leave the desk", about: " ↑↓ Space scroll   1-4 pages   Q menu",
      work: " ↑↓ choose   Enter open   Q menu", project: " ↑↓ scroll   N/P next, prev   Q work/",
      writing: " ↑↓ choose   Enter open   Q menu", online: " ↑↓ choose   Enter open   C copy   Q menu",
    };
    bar(ROWS, hints[this.page], "");
    this.regionsNow = regions;
    return true;
  }

  regions(): Drawn { return { canvas: this.canvas, regions: this.regionsNow }; }
}
