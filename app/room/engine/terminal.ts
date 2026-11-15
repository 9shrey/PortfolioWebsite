import type { RoomContent } from "../types";
import type { Drawn, Region } from "./cards";
import { fonts } from "./surfaces";
import { Snake } from "./snake";

/* The old monitor's terminal: amber phosphor, VT323, 48 columns by 18 rows on a 4:3 tube. It boots the
   first time you sit at it, then shows a menu: about.txt (a pager, like `less`), work/ (the projects, each
   with a page of its own), writing/ (the posts;
   each opens as its own page), online, and the résumé. Keys you type go to it (the desk keyboard presses
   them too); the lines you can click are regions the engine maps clicks onto.

   Not on the menu: a colon opens a command line (help lists most of what it knows; it can work the lamp
   and the curtains, and it has a game), and when nobody has sat at the desk for a while the tube runs a
   screensaver. The tube comes in three phosphors, it can be switched off, and `secrets` counts what the
   visitor has found around the room. */

export type TermPage = "boot" | "menu" | "about" | "work" | "project" | "writing" | "online" | "shell" | "snake" | "matrix";

interface Line {
  text: string;
  kind?: "h" | "dim" | "link" | "big" | "gap";
  action?: string;
  /** Indent of the rows after the first when the line wraps (defaults to its own leading spaces). */
  hang?: number;
  /** Set by wrapped(): a row that carries on the line above, so a link that wraps is still one link. */
  cont?: boolean;
  /** The command line's input row: the cursor blinks after it. */
  cursor?: boolean;
}

const COLS = 48, ROWS = 18;
const W = 1024, H = 768;
/** A phosphor: its lit colour, the same dimmed, the ink on a lit bar, the dark tube, and the tint (linear
 *  rgb) the tube's glass glows with in the engine's shader. */
interface Palette { ink: string; dim: string; dark: string; bg: string; tint: [number, number, number] }
const PHOSPHORS: Record<"amber" | "green" | "white", Palette> = {
  amber: { ink: "#ffb54a", dim: "#a8702e", dark: "#130b03", bg: "#0d0803", tint: [1, 0.75, 0.4] },
  green: { ink: "#62ff96", dim: "#2f8f52", dark: "#031207", bg: "#030c06", tint: [0.4, 1, 0.55] },
  white: { ink: "#e6edff", dim: "#8490ad", dark: "#07090f", bg: "#06080d", tint: [0.82, 0.88, 1] },
};
type Phosphor = keyof typeof PHOSPHORS;
const isPhosphor = (v: string | null): v is Phosphor => !!v && Object.keys(PHOSPHORS).includes(v);
const PHOSPHOR_KEY = "room.phosphor";
const GLYPHS = "0123456789ABCDEF<>[]{}=+*:;/|";
const count = (n: number, one: string) => `${n} ${one}${n === 1 ? "" : "s"}`;
/** The machine the boot screen and neofetch describe: the laptop the room was built and baked on. */
const RIG = { cpu: "i7-9750H", gpu: "GTX 1650, 4 GB", mem: "16384 MB" };
/** What Tab completes on the command line (the unlisted commands stay unlisted). */
const WORDS = ["help", "ls", "open", "about", "work", "writing", "online", "resume", "lamp", "curtains", "sound", "storm", "chai",
  "reel", "snake", "whoami", "date", "uptime", "neofetch", "credits", "secrets", "clear", "exit"];

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
  /** On a touch screen there are no keys: the bottom bar offers the way back (and next/prev) to tap instead. */
  touch = false;
  /** Shown full screen (a phone) rather than on the tube, where a taped photo covers the top right corner. */
  full = false;
  /** Whether the visitor is sitting at the monitor: the game only runs then. */
  seated = false;
  /** Nobody at the desk for a while: the name drifts round the tube instead of the page. */
  saver = false;
  /** Reduced motion: the screensaver moves its name every few seconds instead of gliding. */
  reduced = false;
  private saverStep = -1;
  private matrixStep = -1;
  private phosphor: Phosphor = "amber";
  private p: Palette = PHOSPHORS.amber;
  /** switched off from the command line: the picture folds to a line, then the tube stays dark */
  private off = false;
  private offAt = 0;
  private blank = false;
  // the command line: what it has printed, what is being typed, and what was typed before
  private out: Line[] = [];
  private input = "";
  private hist: string[] = [];
  private hi = 0;
  private blink = 0;
  private snake: Snake | null = null;
  private since = performance.now();

  /** `act` does what a link or a command asks of the room; a command gets a line back to print. */
  constructor(private c: RoomContent, private act: (action: string) => string | void) {
    this.canvas.width = W; this.canvas.height = H;
    let saved: string | null = null;
    try { saved = localStorage.getItem(PHOSPHOR_KEY); } catch {}
    if (isPhosphor(saved) && saved !== "amber") this.setPhosphor(saved, false);
  }

  /** Sitting down wakes the tube (and switches it back on); getting up leaves a game waiting. */
  seat(on: boolean) {
    this.seated = on; this.dirty = true;
    if (!on) return;
    this.saver = false;
    if (this.off) { this.off = false; this.booted = false; }   // the page boots it again
  }
  sleep() { if (!this.seated && !this.off) { this.saver = true; this.saverStep = -1; } }

  private setPhosphor(name: Phosphor, save = true) {
    this.phosphor = name; this.p = PHOSPHORS[name]; this.dirty = true;
    this.act(`room:tint:${this.p.tint.join(",")}`);
    if (save) try { localStorage.setItem(PHOSPHOR_KEY, name); } catch {}
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
    if (p !== "snake") this.snake = null;
    if (p === "shell") {
      if (!this.out.length) this.print("SHREY.SYS command line. Type help, or exit to leave.", "dim");
      this.toEnd();
      this.act("found:shell");
    }
  }

  // ------------------------------------------------------------------ input
  key(e: KeyboardEvent): boolean {
    const k = e.key;
    if (this.off) {   // any key switches it back on
      this.off = false; this.booted = false;
      this.act("room:power:on"); this.boot(performance.now() / 1000);
      return true;
    }
    if (this.page === "boot") { this.go("menu"); return true; }
    if (this.page === "matrix") { this.go("shell"); return true; }
    if (this.page === "shell") return this.shellKey(e);
    if (this.page === "snake") return this.snakeKey(k);
    if (k === ":" || k === "/") return this.go("shell"), true;
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
    if (k === "ArrowDown" || k === "j") { if (pager) this.scrollBy(1); else { this.sel = Math.min(links.length - 1, this.sel + 1); this.reveal(); } this.dirty = true; return true; }
    if (k === "ArrowUp" || k === "k") { if (pager) this.scrollBy(-1); else { this.sel = Math.max(0, this.sel - 1); this.reveal(); } this.dirty = true; return true; }
    if (k === " " || k === "PageDown") { this.scrollBy(ROWS - 4); return true; }
    if (k === "PageUp") { this.scrollBy(-(ROWS - 4)); return true; }
    if (k === "Enter" && links[this.sel]?.action) { this.act(links[this.sel].action!); return true; }
    if ((k === "c" || k === "C") && this.page === "online") { this.act(`copy:${this.c.email}`); return true; }
    return false;
  }
  wheel(dy: number) { this.scrollBy(Math.sign(dy) * 2); }
  /** A finger dragging the page: scrolls by whole rows. */
  drag(rows: number) { this.scrollBy(rows); }
  private scrollBy(n: number) {
    const rows = this.wrapped(), body = ROWS - 3;
    const max = Math.max(0, rows.length - body);
    this.scroll = Math.max(0, Math.min(max, this.scroll + n)); this.dirty = true;
    if (this.pager()) return;
    // on a list, keep the selection on screen so Enter never opens something out of sight
    const heads = this.heads(rows), seen = (i: number) => i >= this.scroll && i < this.scroll + body;
    if (seen(heads[this.sel])) return;
    const onScreen = heads.map((row, k) => ({ row, k })).filter((h) => seen(h.row));
    if (onScreen.length) this.sel = (n > 0 ? onScreen[0] : onScreen[onScreen.length - 1]).k;
  }
  /** The row each link starts on. */
  private heads(rows: Line[]) { return rows.flatMap((r, i) => (r.action && !r.cont ? [i] : [])); }
  /** Scrolls a list just enough to show the selected link and the lines under it, up to the next link. */
  private reveal() {
    const rows = this.wrapped(), body = ROWS - 3, heads = this.heads(rows);
    if (this.sel === 0) { this.scroll = 0; return; }   // the first link: show the page's intro above it too
    const start = heads[this.sel], end = Math.min((heads[this.sel + 1] ?? rows.length) - 1, start + body - 1);
    if (start < this.scroll) this.scroll = start;
    else if (end >= this.scroll + body) this.scroll = end - body + 1;
  }
  private pager() { return this.page === "about" || this.page === "project" || this.page === "shell"; }
  private toEnd() { this.scroll = Math.max(0, this.wrapped().length - (ROWS - 3)); }

  // ------------------------------------------------------------------ the command line
  private print(text: string, kind?: Line["kind"], action?: string) {
    this.out.push({ text, kind, action });
    if (this.out.length > 160) this.out.splice(0, this.out.length - 160);
  }

  private shellKey(e: KeyboardEvent): boolean {
    const k = e.key;
    if (k === "Enter") {
      const line = this.input.trim();
      this.input = ""; this.print(`$ ${line}`, "dim");
      if (line) { if (this.hist[this.hist.length - 1] !== line) this.hist.push(line); this.run(line); }
      this.hi = this.hist.length;
    } else if (k === "Backspace") this.input = this.input.slice(0, -1);
    else if (k === "ArrowUp" || k === "ArrowDown") {
      this.hi = Math.max(0, Math.min(this.hist.length, this.hi + (k === "ArrowUp" ? -1 : 1)));
      this.input = this.hist[this.hi] ?? "";
    } else if (k === "Tab") {
      const words = this.input.split(" "), last = words[words.length - 1].toLowerCase();
      const pool = words.length > 1 ? [...WORDS, ...this.c.cards.map((c) => c.id)] : WORDS;
      const fits = last ? pool.filter((w) => w.startsWith(last)) : [];
      if (fits.length === 1) this.input = [...words.slice(0, -1), fits[0]].join(" ") + " ";
    } else if (k === "PageUp" || k === "PageDown") { this.scrollBy((k === "PageUp" ? -1 : 1) * (ROWS - 4)); return true; }
    else if (k.length === 1 && this.input.length < COLS - 6) this.input += k;
    else return false;
    if (this.page === "shell") this.toEnd();   // a command may have opened another page
    this.dirty = true;
    return true;
  }

  /** Opens what a name on the command line points at: a page, a project, a post. */
  private visit(name: string): boolean {
    const c = this.c;
    const n = name.replace(/^\.?\//, "").replace(/\/$/, "").replace(/\.(txt|pdf|md)$/, "");
    const pages: Record<string, string> = {
      about: "term:about", work: "term:work", writing: "term:writing", online: "term:online", contact: "term:online",
      resume: `ext:${c.resume}`, menu: "term:menu",
    };
    const leaf = n.split("/").pop()!;
    const card = c.cards.find((k) => k.id === leaf || k.label.toLowerCase() === leaf);
    const post = c.posts.find((p) => p.slug === leaf);
    const action = pages[n] ?? (card ? `work:${card.id}` : post ? `href:/writing/${post.slug}` : "");
    if (action) this.act(action);
    return !!action;
  }

  private run(line: string) {
    const c = this.c;
    const [cmd, ...rest] = line.toLowerCase().split(/\s+/);
    const arg = rest.join(" ");
    const say = (text: string, kind?: Line["kind"], action?: string) => this.print(text, kind, action);
    const room = (what: string) => {
      const r = this.act(`room:${what}`);
      if (r) for (const l of r.split("\n")) say(l, l.startsWith("[ ]") ? "dim" : undefined);
    };
    const up = () => {
      const s = Math.floor((performance.now() - this.since) / 1000);
      return s < 60 ? `${s} s` : s < 3600 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${Math.floor(s / 3600)} h ${Math.floor((s % 3600) / 60)} min`;
    };
    switch (cmd) {
      case "help": case "?":
        say("Pages   about  work  writing  online  resume");
        say("        ls lists them; open <name> for one", "dim");
        say("Room    lamp  curtains  sound  storm  chai");
        say("        reel moves the projector on", "dim");
        say("Play    snake");
        say("Also    whoami  date  uptime  neofetch");
        say("        credits  secrets  clear  exit");
        say("A few more aren't listed. secrets keeps count.", "dim");
        break;
      case "ls": case "dir": {
        const d = arg.replace(/^-\S+\s*/, "").replace(/\/$/, "");
        if (!d || d === "." || d === "~") say("about.txt  work/  writing/  online  resume.pdf");
        else if (d === "work") say(c.cards.map((k) => k.id).join("  "));
        else if (d === "writing") c.posts.forEach((p) => say(p.slug));
        else say(`ls: ${d}: no such directory`);
        break;
      }
      case "open": case "cat": case "cd": case "less": case "more":
        if (!arg || arg === "~" || arg === "..") { if (cmd !== "cd") say(`${cmd}: open what? ls lists what's here.`); }
        else if (!this.visit(arg)) say(`${cmd}: ${arg}: nothing here by that name`);
        break;
      case "lamp": case "curtains": case "sound": case "storm": case "chai": case "reel": case "secrets": room(cmd); break;
      case "next": room("reel"); break;
      case "light": case "lights": room("lamp"); break;
      case "curtain": room("curtains"); break;
      case "music": case "mute": room("sound"); break;
      case "thunder": case "lightning": room("storm"); break;
      case "tea": room("chai"); break;
      case "coffee": say("Only chai on this desk."); room("chai"); break;
      case "snake":
        this.snake = new Snake((kind) => { this.act(`sfx:${kind}`); });
        this.page = "snake"; this.dirty = true;
        this.act("found:snake");
        break;
      case "credits":
        say("Built with three.js and Next.js. The light is baked in Blender.");
        say("Furniture and textures: Poly Haven, CC0. The rest is modelled by a script.");
        say("The city is a photograph by Anthony Delanoix, on Unsplash.");
        say("This face is VT323. Every typeface here is under the OFL.");
        say("The rain, the thunder and the waltz are synthesised in your browser.");
        break;
      case "whoami": say("guest"); break;
      case "pwd": say("/home/shrey/desk"); break;
      case "date": say(new Date().toString().replace(/ \(.*\)$/, "")); break;
      case "uptime": say(`The room has been open ${up()}.`); break;
      case "echo": say(line.slice(4).trim()); break;
      case "neofetch":
        ["   ____ ____     guest@ss-26", "  / ___/ ___|    OS       SHREY.SYS", `  \\___ \\___ \\    CPU      ${RIG.cpu}`,
          `   ___) |__) |   GPU      ${RIG.gpu}`, `  |____/____/    Memory   ${RIG.mem}`, `                 Display  ${COLS}x${ROWS}, amber`,
          `                 Uptime   ${up()}`].forEach((l) => say(l));
        break;
      case "clear": case "cls": this.out = []; break;
      case "exit": case "quit": case "q": case "menu": this.go("menu"); break;
      // ---- the ones help doesn't list
      case "color": case "colour": case "phosphor": case "theme":
        if (!isPhosphor(arg)) say(`${cmd}: amber, green or white. It is ${this.phosphor} now.`);
        else { this.setPhosphor(arg); say(`Phosphor: ${arg}.`); this.act("found:phosphor"); }
        break;
      case "matrix": this.page = "matrix"; this.matrixStep = -1; this.dirty = true; this.act("found:matrix"); break;
      case "shutdown": case "poweroff": case "halt":
        this.off = true; this.blank = false; this.offAt = performance.now() / 1000;
        this.act("room:power:off"); this.act("found:shutdown");
        break;
      case "reboot": case "restart":
        this.out = []; this.booted = false; this.boot(performance.now() / 1000);
        break;
      case "weather": say("Rain, as ever. Lightning now and then."); break;
      case "hire": this.hire(); break;
      case "sudo":
        if (arg.includes("hire")) this.hire();
        else say("guest is not in the sudoers file. Asking nicely works: try hire.");
        break;
      case "rm": case "rmdir": case "del": say(`${cmd}: read-only file system. The light in here is baked in.`); break;
      case "vim": case "vi": case "emacs": case "nano": say("No editor installed, so nothing to get stuck in."); break;
      case "hello": case "hi": case "hey": say("Hello. help lists what this can do."); break;
      case "xyzzy": say("Nothing happens."); break;
      case "42": {
        const i = c.books.findIndex((b) => /hitchhiker/i.test(b.title));
        say(i < 0 ? "The answer. Nobody here has the question." : `The answer. The question is on the shelf, book ${i + 1} from the left.`);
        if (i >= 0) say("   look at the shelf", "link", "view:books");
        break;
      }
      default:
        if (!this.visit(cmd)) say(`${cmd}: command not found. help lists the ones that are.`);
    }
  }

  private hire() {
    this.print("Good idea. Email is fastest:");
    this.print(`   ${this.c.email}`, "link", `ext:mailto:${this.c.email}`);
    this.print("   resume.pdf", "link", `ext:${this.c.resume}`);
  }

  private snakeKey(k: string): boolean {
    const s = this.snake!;
    const dirs: Record<string, [number, number]> = {
      arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1], arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0],
    };
    const turn = dirs[k.toLowerCase()];
    if (turn) { if (!s.dead) s.turn(turn[0], turn[1]); }
    else if (k === "Enter" || k === " ") { if (s.dead) s.reset(); }
    else if (k === "q" || k === "Q" || k === "Backspace") {
      this.print(`Score ${s.score}. Best ${Math.max(s.best, s.score)}.`);
      this.go("shell");
    } else return false;
    this.dirty = true;
    return true;
  }

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
        { text: `[2] work/             ${count(c.cards.filter((k) => k.kind === "project").length, "project")}, ${count(c.cards.filter((k) => k.kind === "role").length, "job")}`, kind: "link", action: "term:work" },
        { text: `[3] writing/          ${count(c.posts.length, "post")}`, kind: "link", action: "term:writing" },
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
        { text: "What I think about, written down.", kind: "dim" },
        { text: "", kind: "gap" },
        ...c.posts.flatMap((p) => [
          { text: `${date(p.date)}  ${p.title}`, kind: "link" as const, action: `href:/writing/${p.slug}`, hang: 12 },
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
      case "shell": return [...this.out, { text: `$ ${this.input}`, cursor: true }];
      case "snake": case "matrix": return [];
    }
  }

  /** The page's lines broken to the screen's width (links keep their action on their first row). */
  private wrapped(): Line[] {
    const out: Line[] = [];
    for (const l of this.lines()) {
      if (l.kind === "big" || l.kind === "gap" || l.text.length <= COLS - 2) { out.push(l); continue; }
      const lead = l.text.length - l.text.trimStart().length;
      const hang = " ".repeat(l.hang ?? lead);
      let cur = " ".repeat(lead), cont = false;
      for (const w of l.text.trim().split(/\s+/)) {
        const fresh = !cur.trim();
        if (!fresh && cur.length + 1 + w.length > COLS - 2) { out.push({ ...l, text: cur, cont }); cur = hang + w; cont = true; }
        else cur = fresh ? cur + w : `${cur} ${w}`;
      }
      if (cur.trim()) out.push({ ...l, text: cur, cont });
    }
    return out;
  }

  // ------------------------------------------------------------------ drawing
  /** A cleared tube and the measures everything on it is set by: the character cell, the rows, the two bars. */
  private pen() {
    const g = this.canvas.getContext("2d")!, F = fonts();
    const cw = W / (COLS + 2), lh = H / (ROWS + 2.6), fs = Math.round(lh * 1.1);
    const x0 = cw * 1.6, y = (row: number) => lh * (row + 0.62) + lh * 1.25;
    g.shadowBlur = 0; g.textAlign = "left"; g.fillStyle = this.p.bg; g.fillRect(0, 0, W, H);
    g.font = `${fs}px ${F.pixel}`; g.textBaseline = "alphabetic";
    g.shadowColor = this.p.ink; g.shadowBlur = 10;
    const bar = (row: number, left: string, right: string) => {
      g.shadowBlur = 0; g.fillStyle = this.p.ink; g.fillRect(x0 * 0.5, y(row) - lh * 0.82, W - x0, lh);
      g.fillStyle = this.p.dark; g.fillText(left, x0, y(row)); g.textAlign = "right"; g.fillText(right, W - x0 * 1.7, y(row)); g.textAlign = "left";
      g.shadowBlur = 10;
    };
    return { g, F, cw, lh, fs, x0, y, bar };
  }

  /** The screensaver: the machine's name and the time, drifting corner to corner so nothing burns in. */
  private drawSaver(now: number): boolean {
    const step = this.reduced ? Math.floor(now / 8) : Math.floor(now * 15);
    if (step === this.saverStep) return false;
    this.saverStep = step;
    const { g, F, fs } = this.pen();
    const t = this.reduced ? step * 8 : now;
    const bounce = (v: number) => Math.abs((v % 2) - 1);
    g.font = `${fs * 3}px ${F.pixel}`;
    const name = "SS-26", w = g.measureText(name).width, h = fs * 3.2, pad = 84;
    const x = pad + bounce(t * 0.11) * (W - pad * 2 - w), y = pad + bounce(t * 0.083 + 0.4) * (H - pad * 2 - h);
    g.fillStyle = this.p.ink; g.fillText(name, x, y + fs * 2.1);
    g.font = `${fs}px ${F.pixel}`; g.fillStyle = this.p.dim; g.fillText(new Date().toTimeString().slice(0, 5), x + 4, y + fs * 3.1);
    this.regionsNow = [];
    return true;
  }

  private drawSnake(now: number): boolean {
    const s = this.snake!;
    if (!this.seated) s.paused = true;
    if (!s.tick(now) && !this.dirty) return false;
    this.dirty = false;
    const { g, F, lh, y, bar } = this.pen();
    bar(0, ` snake   score ${s.score}   best ${Math.max(s.best, s.score)}`, "");
    const top = y(0) + lh * 0.18, bottom = y(ROWS) - lh * 0.82;
    s.draw(g, (W - Snake.W) / 2, top + (bottom - top - Snake.H) / 2, this.p, F.pixel);
    bar(ROWS, s.dead ? " Enter play again   Q quit" : " Arrows steer   Q quit", "");
    this.regionsNow = [];
    return true;
  }

  /** Characters falling down the tube, each column at its own pace. Any key stops it. */
  private drawMatrix(now: number): boolean {
    const step = this.reduced ? 0 : Math.floor(now * 14);
    if (step === this.matrixStep && !this.dirty) return false;
    this.matrixStep = step; this.dirty = false;
    const { g, x0, y, bar } = this.pen();
    const hash = (a: number, b: number) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
    const w = g.measureText("0").width, rows = ROWS - 1, tail = 9;
    for (let c = 0; c < COLS - 2; c++) {
      const span = rows + tail + 4 + Math.floor(hash(c, 2) * 14);
      const head = Math.floor((step * (0.35 + hash(c, 1) * 0.6) + hash(c, 3) * span) % span) - 2;
      for (let k = 0; k < tail; k++) {
        const r = head - k;
        if (r < 0 || r >= rows) continue;
        g.globalAlpha = k ? 0.8 * (1 - k / tail) : 1;
        g.fillStyle = k ? this.p.ink : "#fff";
        g.fillText(GLYPHS[Math.floor(hash(c * 31 + r, Math.floor(step / 3) + k) * GLYPHS.length)], x0 + c * w, y(r + 1));
      }
    }
    g.globalAlpha = 1;
    bar(0, " matrix", ""); bar(ROWS, " Any key stops it", "");
    this.regionsNow = [];
    return true;
  }

  /** Draws if something changed (or the boot is running); returns whether it did. */
  draw(now: number): boolean {
    if (this.off) {   // the engine folds the picture to a line; once it has, the tube is left dark
      if (this.blank || now < this.offAt + 0.7) return false;
      this.blank = true; this.pen(); this.regionsNow = [];
      return true;
    }
    if (this.saver) return this.drawSaver(now);
    if (this.page === "matrix") return this.drawMatrix(now);
    if (this.page === "snake" && this.snake) return this.drawSnake(now);
    const booting = this.page === "boot";
    if (this.page === "shell") {   // the cursor
      const b = Math.floor(now * 2) % 2;
      if (b !== this.blink) { this.blink = b; this.dirty = true; }
    }
    if (!this.dirty && !booting) return false;
    this.dirty = false;
    const { g, F, cw, lh, fs, x0, y, bar } = this.pen();
    const regions: Region[] = [];

    if (booting) {
      const t = now - this.bootAt;
      const boot = ["SS-26 BIOS v2.6   (C) 2026 Shrey Singh", "", `${`CPU  ${RIG.cpu} `.padEnd(43, ".")} OK`, `${`GPU  ${RIG.gpu} `.padEnd(43, ".")} OK`,
        `${`MEM  ${RIG.mem} `.padEnd(43, ".")} OK`, "", "Loading SHREY.SYS", `${"Mounting /writing ".padEnd(43, ".")} ${this.c.posts.length}`, "", "Ready."];
      const n = Math.min(boot.length, Math.floor(t / 0.13));
      g.fillStyle = this.p.ink;
      boot.slice(0, n).forEach((l, i) => g.fillText(l, x0, y(i + 1)));
      if (Math.floor(t * 3) % 2 === 0) g.fillRect(x0, y(n + 1) - lh * 0.7, cw * 0.9, lh * 0.8);   // the cursor
      if (t > boot.length * 0.13 + 0.5) { this.page = "menu"; this.dirty = true; }
      this.regionsNow = [];
      return true;
    }

    const proj = this.c.cards.find((x) => x.id === this.card);
    const names: Record<TermPage, string> = { boot: "", menu: "SS-26", about: "about.txt", work: "work/", project: `work/${proj?.id ?? ""}`, writing: "writing/", online: "online", shell: "command line", snake: "snake", matrix: "matrix" };
    const rows = this.wrapped();
    const body = ROWS - 3;
    const pager = this.pager(), shell = this.page === "shell";
    const pct = rows.length <= body ? 100 : Math.round(((this.scroll + body) / rows.length) * 100);
    const clock = new Date().toTimeString().slice(0, 5);
    // the polaroid taped to the monitor covers the bar's right end: the top bar's right side stops short of it
    bar(0, ` ${names[this.page]}`, (pager && !shell ? `${Math.min(100, pct)}%  ${this.scroll + 1}-${Math.min(rows.length, this.scroll + body)}/${rows.length} ` : `${clock} `) + (this.full ? "" : "      "));

    const visible = rows.slice(this.scroll, this.scroll + body);
    // which link a row belongs to, for the keyboard selection; links above the window still count
    let li = this.heads(rows).filter((h) => h < this.scroll).length - 1;
    visible.forEach((r, i) => {
      const row = i + 2;
      if (r.kind === "big") {
        g.save(); g.font = `${fs * 2}px ${F.pixel}`; g.fillStyle = this.p.ink; g.fillText(r.text, x0, y(row + 0.6)); g.restore();
        return;
      }
      const isLink = !!r.action;
      if (isLink && !r.cont) li++;
      const on = isLink && li === this.sel && !pager;
      if (on) { g.shadowBlur = 0; g.fillStyle = this.p.ink; g.fillRect(x0 - cw * 0.4, y(row) - lh * 0.8, W - x0 * 2 + cw * 0.8, lh * 0.98); g.shadowBlur = 10; }
      g.fillStyle = on ? this.p.dark : r.kind === "dim" ? this.p.dim : this.p.ink;
      g.fillText(r.text, x0, y(row));
      if (r.cursor && this.blink) g.fillRect(x0 + g.measureText(r.text).width + 2, y(row) - lh * 0.7, cw * 0.9, lh * 0.8);
      if (isLink && !on) {
        const indent = r.text.length - r.text.trimStart().length;   // underline the words, not the indent
        const from = g.measureText(r.text.slice(0, indent)).width;
        g.fillRect(x0 + from, y(row) + 4, g.measureText(r.text).width - from, 2);
      }
      if (isLink) regions.push({ x: 0, y: y(row) - lh * 0.82, w: W, h: lh, action: r.action!, label: r.text.trim() });
    });
    // a list longer than the screen says so (a pager shows its place in the top bar instead)
    const more = pager ? "" : rows.length > this.scroll + body ? "more ↓ " : this.scroll > 0 ? "more ↑ " : "";
    const hints: Record<TermPage, string> = {
      boot: "", menu: " 1-5 open   : command line   Q leave the desk",
      shell: " help lists commands   exit leaves", snake: "", matrix: "", about: " ↑↓ Space scroll   1-4 pages   Q menu",
      work: " ↑↓ choose   Enter open   Q menu", project: " ↑↓ scroll   N/P next, prev   Q work/",
      writing: " ↑↓ choose   Enter open   Q menu", online: " ↑↓ choose   Enter open   C copy   Q menu",
    };
    if (this.touch) {
      // no keyboard: the same bar, as things to tap
      const taps: Record<TermPage, [string, string?][]> = {
        boot: [], menu: [["Tap a line to open it"]],
        about: [["< menu", "term:menu"], ["drag to scroll"]],
        work: [["< menu", "term:menu"], ["tap to open"]],
        project: [["< work/", "term:work"], ["< prev", "card:prev"], ["next >", "card:next"]],
        writing: [["< menu", "term:menu"], ["tap to open"]],
        online: [["< menu", "term:menu"], ["tap to open"]],
        shell: [["< menu", "term:menu"]], snake: [["< menu", "term:menu"]], matrix: [["< menu", "term:menu"]],
      };
      bar(ROWS, "", more);
      g.shadowBlur = 0; g.fillStyle = this.p.dark;
      let x = x0;
      for (const [text, action] of taps[this.page]) {
        const w = g.measureText(text).width;
        g.fillText(text, x, y(ROWS));
        if (action) {
          g.fillRect(x, y(ROWS) + 4, w, 2);
          regions.push({ x: x - cw, y: y(ROWS) - lh * 1.1, w: w + cw * 2, h: lh * 1.6, action, label: text });
        }
        x += w + cw * 3;
      }
      g.shadowBlur = 10;
    } else bar(ROWS, hints[this.page], more);
    this.regionsNow = regions;
    return true;
  }

  regions(): Drawn { return { canvas: this.canvas, regions: this.regionsNow }; }
}
