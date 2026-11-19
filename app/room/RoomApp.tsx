"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_SETTINGS, RoomEngine, type Hit, type Settings } from "./engine/engine";
import { RoomAudio } from "./engine/audio";
import { drawCalendar, fontsLoaded } from "./engine/surfaces";
import { drawPhone } from "./engine/cards";
import { Reel } from "./engine/reel";
import { occasion } from "./engine/occasions";
import { Terminal, type TermPage } from "./engine/terminal";
import type { RoomContent, View } from "./types";

/* The page around the room: loading, three titles and two small controls. Everything else is in the
   room, to be found: the old monitor (about, work, writing, online; the GPU cards on the bench open
   their project there), the projector looping visuals, the phone (contact),
   the résumé in its tray, the books on the shelf, the year on the wall. Nothing is labelled. The URL
   hash mirrors the view (#work/inferbench, #writing, ...).

   Hidden, for whoever goes looking: the monitor has a command line (a colon opens it) that can work the
   lamp and curtains and has a game; a certain old cheat code sets the shelf off; the ball answers the
   seventh click; lightning now and then; and a note in the browser console. The ones in SECRETS below
   are counted as the visitor finds them (kept in this browser); `secrets` at the command line lists them. */

/* Writing is the one section that leaves the room: it is its own pages, as on Felix's site. */
const NAV: { view: View | null; href: string; label: string }[] = [
  { view: { kind: "work", card: "" }, href: "#work", label: "Work" },
  { view: null, href: "/writing", label: "Writing" },
  { view: { kind: "about" }, href: "#about", label: "About" },
];
const TERM: View["kind"][] = ["about", "work", "writing", "online", "terminal"];
const LOADING = ["Opening the curtains", "Switching on the lamp", "Slotting the cards", "Pouring the chai", "Warming up the tube"];

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
let greeted = false;

/** The hidden things that are counted: what each is called once found, and the hint shown until then. */
const SECRETS: [key: string, name: string, hint: string][] = [
  ["shell", "the command line", "the monitor takes commands"],
  ["snake", "snake", "help lists a game"],
  ["konami", "the cheat code", "a cheat code older than this monitor"],
  ["wish", "the ball, seven times", "something on the shelf answers to seven"],
  ["storm", "lightning on demand", "the weather takes requests"],
  ["cups", "five cups of chai", "the mug keeps count"],
  ["battery", "the clock's battery", "the wall clock can be stopped"],
  ["phosphor", "a different phosphor", "the tube comes in three colours"],
  ["matrix", "the rain, indoors", "there is a rain you can run"],
  ["shutdown", "the off switch", "it can be switched off, and on again"],
];
const FOUND_KEY = "room.found";
function loadFound(): Set<string> {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(FOUND_KEY) || "[]");
    return new Set(Array.isArray(saved) ? saved.filter((k) => SECRETS.some(([key]) => key === k)) : []);
  } catch { return new Set(); }
}

const SETTINGS_KEY = "room.settings";
function loadSettings(): Settings {
  try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") }; } catch { return DEFAULT_SETTINGS; }
}

function toHash(v: View) {
  if (v.kind === "home") return "";
  if (v.kind === "work") return v.card ? `#work/${v.card}` : "#work";
  if (v.kind === "books") return "#books";
  if (v.kind === "poster") return `#poster/${v.i}`;
  return `#${v.kind}`;
}
function fromHash(h: string, content: RoomContent): View {
  const [k, id] = h.replace(/^#/, "").split("/");
  if (k === "work") return { kind: "work", card: content.cards.some((c) => c.id === id) ? id : "" };
  if (k === "books") return { kind: "books" };
  if (k === "poster" && Number(id) >= 0 && Number(id) < 6) return { kind: "poster", i: Number(id) };
  if (["about", "writing", "online", "terminal", "contact", "year", "resume", "projector"].includes(k)) return { kind: k } as View;
  return { kind: "home" };
}

export default function RoomApp({ content, onFail }: { content: RoomContent; onFail(): void }) {
  const host = useRef<HTMLDivElement>(null);
  const engine = useRef<RoomEngine | null>(null);
  const audio = useRef<RoomAudio | null>(null);
  const term = useRef<Terminal | null>(null);
  const termView = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<View>({ kind: "home" });
  const [installed, setInstalled] = useState<string>(content.bench);
  const [sound, setSound] = useState(false);
  const [hint, setHint] = useState(true);
  const [settings, setSettings] = useState<Settings>(loadSettings);   // client-only component: localStorage is there
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fps, setFps] = useState(0);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(0);
  const cups = useRef(0);
  const reel = useRef<Reel | null>(null);
  const [foundSet] = useState(loadFound);
  const [foundCount, setFoundCount] = useState(() => foundSet.size);
  // a touch screen's keyboard needs a text field to type into: this one, out of sight; the prompt mirrors it
  const kbd = useRef<HTMLInputElement>(null);
  const [typing, setTyping] = useState(false);
  const [late] = useState(() => new Date().getHours() < 5);
  const code = useRef(0);
  const [minute, setMinute] = useState(() => Math.floor(Date.now() / 60000));
  // on a phone 48 columns on a tube across the room would be unreadable: the terminal fills the screen instead
  const [narrow] = useState(() => matchMedia("(max-width: 760px)").matches);
  // a tablet keeps the tube in the room, but has no keys or wheel: it gets the tappable bar and drag to scroll
  const [coarse] = useState(() => matchMedia("(pointer: coarse)").matches);

  const say = useCallback((text: string, ms = 2800) => {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), ms);
  }, []);

  /** Marks a hidden thing as found. The first time, a note says so with the running count; `lead` is
   *  what the thing itself has to say, shown every time. */
  const found = useCallback((key: string, lead?: string) => {
    const name = SECRETS.find(([k]) => k === key)?.[1];
    if (!name || foundSet.has(key)) { if (lead) say(lead); return; }
    foundSet.add(key);
    try { localStorage.setItem(FOUND_KEY, JSON.stringify([...foundSet])); } catch {}
    setFoundCount(foundSet.size);
    const all = foundSet.size === SECRETS.length;
    say(`${lead ?? `Found: ${name}.`} ${foundSet.size} of ${SECRETS.length}.${all ? " That's all of them." : ""}`, all ? 5200 : 3600);
    if (all) { engine.current?.wave(0.4); audio.current?.click("win"); }   // the shelf sees the last one in
  }, [foundSet, say]);

  /** One more cup from the mug; the fifth is worth a note. */
  const cup = useCallback(() => {
    const n = ++cups.current;
    if (n === 5) found("cups", "Five cups. Maybe some water."); else if (n === 12) say("Twelve. That was the whole pot.");
    return n;
  }, [found, say]);

  const toggleSound = useCallback(async () => {
    const a = audio.current!;
    if (a.on) { a.stop(); setSound(false); } else { await a.start(); setSound(true); }
  }, []);

  const navigate = useCallback((v: View, push = true) => {
    const e = engine.current;
    if (v.kind === "work") {
      v = { kind: "work", card: v.card ?? "" };
      if (v.card) e?.install(v.card);
    }
    const t = term.current;
    t?.seat(TERM.includes(v.kind));
    if (t && TERM.includes(v.kind)) {
      t.boot(performance.now() / 1000);
      if (v.kind === "work") t.open(v.card);
      else if (v.kind !== "terminal") t.go(v.kind as TermPage);
    }
    setView(v);
    if (v.kind === "poster") e?.showPoster(v.i); else { e?.hidePoster(); e?.go(v); }
    e?.setCrtPower(TERM.includes(v.kind));
    setHint(false);
    const h = toHash(v);
    if (push && location.hash !== h) history.pushState(null, "", h || location.pathname + location.search);
  }, []);

  /** A key for the terminal. Afterwards the view (and the URL) follows whatever page it ended up on. */
  const termKey = useCallback((key: string) => {
    const t = term.current;
    if (!t) return false;
    const used = t.key({ key });
    if (used) audio.current?.click("key");
    const k: Record<TermPage, View> = {
      boot: { kind: "terminal" }, menu: { kind: "terminal" }, about: { kind: "about" }, writing: { kind: "writing" }, online: { kind: "online" },
      work: { kind: "work", card: "" }, project: { kind: "work", card: t.card }, shell: { kind: "terminal" }, snake: { kind: "terminal" }, matrix: { kind: "terminal" },
    };
    const want = k[t.page];
    if (toHash(want) !== toHash(view)) {
      if (want.kind === "work" && want.card) engine.current?.install(want.card);
      setView(want); history.replaceState(null, "", toHash(want) || location.pathname + location.search);
    }
    return used;
  }, [view]);

  /** The old cheat code, a step at a time: a key's name, or "tap" where a touch screen has no B and A.
   *  Returns whether that step finished it. */
  const cheat = useCallback((token: string) => {
    const want = KONAMI[code.current];
    const hit = token === "tap" ? want === "b" || want === "a" : token.toLowerCase() === want.toLowerCase();
    code.current = hit ? code.current + 1 : token === "ArrowUp" ? (code.current === 2 ? 2 : 1) : 0;   // a third Up is still two Ups
    if (code.current < KONAMI.length) return false;
    code.current = 0;
    navigate({ kind: "books" }); engine.current?.wave(1.3);
    audio.current?.click("win"); found("konami", "Cheat code accepted.");
    return true;
  }, [navigate, found]);

  const step = useCallback((dir: 1 | -1) => {
    const cur = view.kind === "work" && view.card ? view.card : installed;
    const i = content.cards.findIndex((c) => c.id === cur);
    const next = content.cards[(i + dir + content.cards.length) % content.cards.length];
    navigate({ kind: "work", card: next.id });
  }, [view, installed, content, navigate]);

  // what the terminal's command line can do to the room; each answers with a line for it to print
  const roomCmd = useCallback((what: string): string | void => {
    const e = engine.current, a = audio.current;
    if (!e) return;
    if (what === "lamp") { const on = e.toggleLamp(); a?.click("switch"); return on ? "The lamp is on." : "The lamp is off."; }
    if (what === "curtains") { const shut = e.toggleCurtains(); a?.click("swish"); return shut ? "Curtains drawn." : "Curtains open."; }
    if (what === "sound") { const on = !a?.on; toggleSound(); return on ? "Sound on: rain, and a waltz." : "Sound off."; }
    if (what === "storm") {
      if (!e.strike()) return "No flashes while reduced motion is on.";
      found("storm");
      return a?.on ? "Count the seconds." : "Lightning. Turn sound on to hear it land.";
    }
    if (what === "chai") { e.sip(); a?.click("sip"); return `Cup ${cup()}.`; }
    if (what === "fireworks") {
      if (!e.fireworks(20, 1.3)) return "No fireworks while reduced motion is on.";
      return a?.on ? "Out of the window, over the city." : "Out of the window, over the city. Sound on for the bangs.";
    }
    if (what === "snow") { const on = !e.snowing; e.setSnow(on); a?.setSnow(on); return on ? "Snow. The city goes quiet." : "Back to rain."; }
    if (what === "weather") return e.snowing ? "Snow, and the city quiet for once." : "Rain, as ever. Lightning now and then.";
    if (what === "reel") { reel.current?.skip(); a?.click("tick"); return "The projector moves on to the next piece."; }
    if (what === "secrets") return [`Found ${foundSet.size} of ${SECRETS.length}.`,
      ...SECRETS.map(([key, name, hint]) => (foundSet.has(key) ? `[x] ${name}` : `[ ] ${hint}`))].join("\n");
    if (what === "power:off") return e.crtOff();
    if (what === "power:on") return e.setCrtPower(true);
    if (what.startsWith("tint:")) { const [r, g, b] = what.slice(5).split(",").map(Number); return e.setCrtTint(r, g, b); }
  }, [toggleSound, found, cup, foundSet]);

  // what a link drawn in the room does
  const act = useCallback((action: string): string | void => {
    const [kind, ...rest] = action.split(":"); const arg = rest.join(":");
    if (kind === "sfx") return audio.current?.click(arg as "blip" | "over");
    if (kind === "room") return roomCmd(arg);
    if (kind === "found") return found(arg);
    audio.current?.click("tick");
    if (kind === "href") location.href = arg;
    else if (kind === "ext") { if (arg.startsWith("mailto:")) location.href = arg; else window.open(arg, "_blank", "noopener"); }
    else if (kind === "copy") { navigator.clipboard?.writeText(arg); say("Copied", 1600); }
    else if (kind === "card") step(arg === "next" ? 1 : -1);
    else if (kind === "work") navigate({ kind: "work", card: arg });
    else if (kind === "view") navigate({ kind: arg } as View);
    else if (kind === "term") {
      // navigate() opens a page; the menu and the command line are the terminal with none open
      if (arg === "menu" || arg === "shell") term.current?.go(arg);
      navigate((arg === "work" ? { kind: "work", card: "" } : { kind: arg === "menu" || arg === "shell" ? "terminal" : arg }) as View);
      if (arg === "shell") kbd.current?.focus(); else kbd.current?.blur();
    }
    else if (kind === "kbd") kbd.current?.focus();
    // a tap standing in for a key (the dark tube, the game's bar); from elsewhere in the room it sits down first
    else if (kind === "key") { if (TERM.includes(view.kind)) termKey(arg); else navigate({ kind: "terminal" }); }
  }, [step, navigate, roomCmd, say, found, termKey, view]);
  useEffect(() => { actRef.current = act; }, [act]);

  // engine
  useEffect(() => {
    if (!host.current) return;
    let alive = true;
    const e = new RoomEngine(host.current, {
      progress: (p) => alive && setProgress(p),
      ready: () => alive && setReady(true),
      installed: (id) => { setInstalled(id); audio.current?.click("card"); },
      key: () => audio.current?.click("key"),
      fps: (f) => alive && setFps(f),
      // the bang trails the burst: it's a few blocks away
      burst: (delay) => setTimeout(() => alive && audio.current?.click("pop"), (delay + 0.5 + Math.random() * 0.6) * 1000),
      // thunder trails the flash, further off the smaller the strike
      thunder: (big) => setTimeout(() => alive && audio.current?.click("thunder"), big ? 350 : 900 + Math.random() * 1800),
      secret: (name) => { if (alive && name === "wish") found("wish", "That's seven. Make a wish."); },
    });
    engine.current = e;
    if (process.env.NODE_ENV !== "production") (window as unknown as { __room: RoomEngine }).__room = e;
    e.load().catch((err) => { console.error(err); onFail(); });
    audio.current = new RoomAudio();
    if (!greeted) {   // for whoever opens the console
      greeted = true;
      console.log(`%c${content.name}%c\nYou opened the console, so: the room is three.js over lightmaps baked in Blender, and nothing in it is a video.\nThe old monitor on the desk takes commands. Sit at it and press the colon key.\n${content.links[0]?.href ?? ""}`,
        "font: 700 22px monospace; color: #ffb54a; background: #0d0803; padding: 6px 12px", "font: 13px/1.6 monospace");
    }
    return () => { alive = false; e.dispose(); audio.current?.dispose(); engine.current = null; };
  }, [content, onFail, found]);

  // clicks in the room
  useEffect(() => {
    engine.current?.setEvents({
      click: (hit: Hit) => {
        if (hit.kind === "card") return navigate({ kind: "work", card: hit.id });
        // looking at the projector already: a click on the screen winds the reel on to the next piece
        if (hit.kind === "view" && hit.view.kind === "projector" && view.kind === "projector") { reel.current?.skip(); audio.current?.click("tick"); return; }
        if (hit.kind === "view") return navigate(TERM.includes(hit.view.kind) && TERM.includes(view.kind) ? view : hit.view);
        if (hit.kind === "action") return act(hit.action);
        if (hit.name.startsWith("poster_")) return navigate({ kind: "poster", i: Number(hit.name.slice(7)) });
        if (hit.name === "mug") cup();
        if (hit.name === "clock") found("battery");
        audio.current?.click(hit.name === "mug" ? "sip" : hit.name === "fan" ? "whirr" : hit.name === "lamp" ? "switch" : hit.name === "curtains" ? "swish" : "tick");
      },
    });
  }, [navigate, act, ready, view, cup, found]);

  // the old monitor's terminal: drawn when it changes (and through the boot), on the tube and, on a phone, full screen
  useEffect(() => {
    if (!ready) return;
    const t = new Terminal(content, (a) => actRef.current(a));
    t.touch = narrow || coarse; t.full = narrow;
    t.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    term.current = t;
    if (process.env.NODE_ENV !== "production") (window as unknown as { __term: Terminal }).__term = t;
    let raf = 0, alive = true;
    const paint = () => {
      raf = requestAnimationFrame(paint);
      if (!t.draw(performance.now() / 1000)) return;
      engine.current?.setSurface("crt_screen", t.canvas);
      engine.current?.setRegions("crt_screen", t.regions());
      const v = termView.current;
      if (v) { v.width = t.canvas.width; v.height = t.canvas.height; v.getContext("2d")!.drawImage(t.canvas, 0, 0); }
    };
    fontsLoaded().then(() => { if (!alive) return; t.dirty = true; paint(); });
    // a face that turns up later (a slow network) repaints the tube in it
    const late = () => { t.dirty = true; };
    document.fonts.addEventListener("loadingdone", late);
    const tick = setInterval(() => { t.dirty = true; }, 20000);   // the clock in its status bar
    engine.current?.setCrtPower(false);
    return () => { alive = false; cancelAnimationFrame(raf); clearInterval(tick); document.fonts.removeEventListener("loadingdone", late); term.current = null; };
  }, [ready, content, narrow, coarse]);
  const actRef = useRef<(a: string) => string | void>(() => {});
  // nobody at the desk for half a minute: the tube goes to its screensaver until someone sits down
  const seated = TERM.includes(view.kind);
  useEffect(() => {
    if (!ready || seated) return;
    const id = setTimeout(() => term.current?.sleep(), 30000);
    return () => clearTimeout(id);
  }, [ready, seated]);

  // the sky outside, by the date: snow in deep winter, fireworks at New Year and around Diwali.
  // Checked again each minute, so midnight on the 31st arrives on its own.
  useEffect(() => {
    if (!ready) return;
    const override = new URLSearchParams(location.search).get("sky");
    let season: boolean | null = null, greeted = false;
    const look = () => {
      const e = engine.current, s = occasion(new Date(), override);
      if (!e) return;
      if (s.snow !== season) { season = s.snow; e.setSnow(s.snow); audio.current?.setSnow(s.snow); }   // the season only, so `snow` at the prompt sticks
      if (!s.fireworks) return;
      if (!e.firing) e.fireworks(s.fireworks === "newyear" ? 70 : 25, s.fireworks === "newyear" ? 1.6 : 0.8);
      if (!greeted) { greeted = true; setTimeout(() => say(s.fireworks === "newyear" ? "Happy New Year." : "Happy Diwali.", 4000), 3000); }
    };
    look();
    const id = setInterval(look, 60000);
    return () => clearInterval(id);
  }, [ready, say]);

  // the planner once fonts are in
  useEffect(() => {
    if (!ready) return;
    fontsLoaded().then(() => engine.current?.setSurface("calendar", drawCalendar(document.createElement("canvas"), content.year, content.goals)));
  }, [ready, content]);
  // the projector: a reel of generative pieces on a loop, at 30 frames a second (slowed right down for reduced motion)
  useEffect(() => {
    if (!ready) return;
    const r = new Reel();
    reel.current = r;
    if (process.env.NODE_ENV !== "production") (window as unknown as { __reel: Reel }).__reel = r;
    const slow = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0.08 : 1;
    let raf = 0, last = 0;
    const paint = (now: number) => {
      raf = requestAnimationFrame(paint);
      if (now - last < 1000 / 30) return;
      last = now;
      r.draw((now / 1000) * slow);
      engine.current?.setSurface("screen", r.canvas);
    };
    raf = requestAnimationFrame(paint);
    return () => { cancelAnimationFrame(raf); reel.current = null; };
  }, [ready]);

  // the phone: a lock screen lying on the desk, the contact card when it's picked up
  useEffect(() => {
    const t = setInterval(() => setMinute(Math.floor(Date.now() / 60000)), 15000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const open = view.kind === "contact";
    fontsLoaded().then(() => {
      const d = drawPhone(content, open);
      engine.current?.setSurface("phone_screen", d.canvas);
      engine.current?.setRegions("phone_screen", open ? d : null);
    });
  }, [ready, view, content, minute]);

  // the résumé: the page in the tray is the link
  useEffect(() => {
    if (!ready) return;
    const c = document.createElement("canvas"); c.width = 100; c.height = 141;
    engine.current?.setRegions("resume_page", view.kind === "resume"
      ? { canvas: c, regions: [{ x: 0, y: 0, w: 100, h: 141, action: `ext:${content.resume}`, label: "Résumé" }] } : null);
  }, [ready, view, content]);

  // first view from the URL, then back/forward
  useEffect(() => {
    if (!ready) return;
    engine.current?.install(installed, true);
    const start = fromHash(location.hash, content);
    if (start.kind !== "home") setTimeout(() => navigate(start, false), 700);
    const pop = () => navigate(fromHash(location.hash, content), false);
    addEventListener("popstate", pop);
    return () => removeEventListener("popstate", pop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // keys: Esc goes back; at the monitor they go to its terminal
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.target instanceof HTMLInputElement || ev.metaKey || ev.ctrlKey) return;
      if (ev.key === "Escape") { setSettingsOpen(false); navigate({ kind: "home" }); return; }
      // the old cheat code, from anywhere but a line being typed: the shelf answers
      const busy = TERM.includes(view.kind) && ["shell", "snake", "matrix"].includes(term.current?.page ?? "");
      if (!busy && cheat(ev.key)) { ev.preventDefault(); return; }
      // at the monitor, keys go to its terminal; Q on its menu gets up from the desk
      const t = term.current;
      if (t && TERM.includes(view.kind)) {
        if ((ev.key === "q" || ev.key === "Q") && t.page === "menu") { navigate({ kind: "home" }); return; }
        if (termKey(ev.key)) ev.preventDefault();
      }
    };
    const onWheel = (ev: WheelEvent) => { if (TERM.includes(view.kind) && !(ev.target as Element).closest?.(".room-settings")) term.current?.wheel(ev.deltaY); };
    // a finger dragged up or down over the room scrolls the tube (on a phone the full-screen terminal does this itself)
    let touchY: number | null = null;
    let from: { x: number; y: number } | null = null;   // where the finger went down, for swipes
    const onTouchDown = (ev: PointerEvent) => {
      const on = ev.pointerType === "touch" && (ev.target as Element).closest?.(".room-canvas");
      touchY = on ? ev.clientY : null; from = on ? { x: ev.clientX, y: ev.clientY } : null;
    };
    const onTouchMove = (ev: PointerEvent) => {
      if (touchY === null || ev.pointerType !== "touch" || narrow || !TERM.includes(view.kind)) return;
      const t = term.current;
      if (t?.page === "snake" && from) {   // a flick steers the snake
        const dx = ev.clientX - from.x, dy = ev.clientY - from.y;
        if (Math.hypot(dx, dy) > 24) { t.swipe(dx, dy); from = { x: ev.clientX, y: ev.clientY }; }
        return;
      }
      const n = Math.trunc((touchY - ev.clientY) / 24);
      if (n) { touchY -= n * 24; t?.drag(n); }
    };
    const onTouchEnd = (ev: PointerEvent) => {
      // the cheat code without keys: the eight directions as swipes across the room, then two taps
      if (from && ev.type === "pointerup" && !TERM.includes(view.kind)) {
        const dx = ev.clientX - from.x, dy = ev.clientY - from.y, d = Math.hypot(dx, dy);
        cheat(d < 10 ? "tap" : d < 40 ? "" : Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "ArrowRight" : "ArrowLeft") : dy > 0 ? "ArrowDown" : "ArrowUp");
      }
      touchY = null; from = null;
    };
    addEventListener("keydown", onKey);
    addEventListener("wheel", onWheel, { passive: true });
    addEventListener("pointerdown", onTouchDown); addEventListener("pointermove", onTouchMove);
    addEventListener("pointerup", onTouchEnd); addEventListener("pointercancel", onTouchEnd);
    return () => {
      removeEventListener("keydown", onKey); removeEventListener("wheel", onWheel);
      removeEventListener("pointerdown", onTouchDown); removeEventListener("pointermove", onTouchMove);
      removeEventListener("pointerup", onTouchEnd); removeEventListener("pointercancel", onTouchEnd);
    };
  }, [navigate, view, narrow, cheat, termKey]);

  // settings: remembered in this browser
  useEffect(() => {
    if (ready) engine.current?.setSettings(settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
  const changeSettings = (s: Settings) => {
    setSettings(s); engine.current?.setSettings(s);
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {}
  };

  const atHome = view.kind === "home";
  const navOn = (k: View["kind"]) => k === view.kind;

  return (
    <div ref={host} className={`room ${ready ? "is-ready" : ""} view-${view.kind}`}>
      <p className="sr-only">A desk at night by a rainy window in New York. Things on the desk and around the room open what they hold; the reading view has all of it as plain text.</p>

      <div className={`room-loader ${ready ? "is-done" : ""}`} aria-hidden={ready} style={{ ["--p" as string]: progress }}>
        {/* the room itself, out of focus, coming into focus as it loads */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="loader-still" src="/room/still.webp" alt="" />
        {/* a boot log, as the old monitor would print it: each line ticks over as its part arrives */}
        <div className="loader-term" role="status" aria-live="polite">
          <p className="lt-name">{content.name.toUpperCase()}</p>
          {LOADING.map((l, i) => {
            const at = (i + 1) / LOADING.length, done = progress >= at, now = !done && progress >= i / LOADING.length;
            return (now || done) && (
              <p key={l} className={done ? "is-done" : ""}>
                <span>{l}</span><span>{done ? "OK" : `${Math.round(progress * 100)}%`}</span>
              </p>
            );
          })}
          <p className="lt-cursor" aria-hidden>_</p>
        </div>
      </div>

      <header className="room-head">
        <button className="room-name" onClick={() => navigate({ kind: "home" })}>
          <span className="n">{content.name}</span>
          <span className="t">{content.title}, {content.location.split(",")[0]}</span>
        </button>
        <nav className="room-nav" aria-label="Sections">
          {NAV.map((n) => (
            <a key={n.label} href={n.href} aria-current={n.view && navOn(n.view.kind) ? "page" : undefined}
              onClick={n.view ? (e) => { e.preventDefault(); navigate(n.view!); } : undefined}>
              {n.label}
            </a>
          ))}
          <span className="room-tools">
            <button className="room-icon" onClick={toggleSound} aria-pressed={sound} aria-label={sound ? "Sound on. Turn off" : "Sound off. Turn on"}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />{sound
                ? <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                : <path d="M16.5 9.5l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}</svg>
            </button>
            <button className="room-icon" onClick={() => setSettingsOpen((o) => !o)} aria-expanded={settingsOpen} aria-label="Settings">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><path d="M4 7h10M18 7h2M4 17h4M12 17h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="16" cy="7" r="2" stroke="currentColor" strokeWidth="1.8" fill="none" /><circle cx="10" cy="17" r="2" stroke="currentColor" strokeWidth="1.8" fill="none" /></svg>
            </button>
          </span>
        </nav>
      </header>

      {settingsOpen && <SettingsPanel s={settings} onChange={changeSettings} onClose={() => setSettingsOpen(false)} found={foundCount} hidden={SECRETS.length} />}
      {settings.fps && ready && <p className="room-fps" aria-hidden>{fps} fps</p>}

      {ready && hint && atHome && <p className="room-hint">{late ? "Up late? Have a look around." : "Have a look around."}</p>}

      {!atHome && (
        <button className="room-back" onClick={() => navigate({ kind: "home" })}>Back to the desk <kbd>· Esc</kbd></button>
      )}
      {toast && <p className="room-toast" role="status">{toast}</p>}

      {(narrow || coarse) && (
        <form className="term-kbd" onSubmit={(e) => {
          e.preventDefault();
          termKey("Enter");
          if (kbd.current) { kbd.current.value = ""; if (!term.current?.prompting()) kbd.current.blur(); }   // a command may have left the prompt
        }}>
          <input ref={kbd} type="text" aria-label="Command line" enterKeyHint="go" autoCapitalize="none" autoCorrect="off" autoComplete="off" spellCheck={false}
            onFocus={() => { setTyping(true); if (term.current) term.current.dirty = true; }} onBlur={() => setTyping(false)}
            onInput={(e) => {
              const t = term.current, el = e.currentTarget;
              if (t?.prompting()) t.type(el.value); else { el.value = ""; el.blur(); }
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") e.currentTarget.blur();
              else if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "Tab") { e.preventDefault(); termKey(e.key); e.currentTarget.value = term.current?.typed() ?? ""; }
            }} />
        </form>
      )}

      {/* a phone always reads the terminal full screen; a tablet does while its keyboard is up, so the prompt clears it */}
      {(narrow || typing) && TERM.includes(view.kind) && (
        <div className={`term-full ${typing ? "is-typing" : ""}`}>
          <canvas ref={termView} className="term-tube" aria-label="Terminal. Tap a line to open it."
            onPointerDown={(e) => { drag.current = { x: e.clientX, y: e.clientY, moved: false }; }}
            onPointerMove={(e) => {
              const d = drag.current, t = term.current; if (!d || !t || !e.buttons && e.pointerType === "mouse") return;
              if (t.page === "snake") {   // a flick steers the snake
                const dx = e.clientX - d.x, dy = e.clientY - d.y;
                if (Math.hypot(dx, dy) > 24) { t.swipe(dx, dy); d.x = e.clientX; d.y = e.clientY; d.moved = true; }
                return;
              }
              const row = e.currentTarget.getBoundingClientRect().height / 20.6;   // one terminal row on screen
              const n = Math.trunc((d.y - e.clientY) / row);
              if (n) { d.y -= n * row; d.moved = true; t.drag(n); }
            }}
            onClick={(e) => {
              if (drag.current?.moved) { drag.current = null; return; }   // that was a scroll, not a tap
              const t = term.current; if (!t) return;
              const r = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - r.left) / r.width) * t.canvas.width, y = ((e.clientY - r.top) / r.height) * t.canvas.height;
              const hit = t.regions().regions.find((g) => x >= g.x && x <= g.x + g.w && y >= g.y && y <= g.y + g.h);
              if (hit) act(hit.action);
            }}
            onWheel={(e) => term.current?.wheel(e.deltaY)} />
        </div>
      )}
    </div>
  );
}

function SettingsPanel({ s, onChange, onClose, found, hidden }: { s: Settings; onChange(s: Settings): void; onClose(): void; found: number; hidden: number }) {
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => onChange({ ...s, [k]: v });
  const toggles: [keyof Settings, string, string][] = [
    ["glow", "Glow", "Light from the lamp, the slide and the windows blooms a little."],
    ["grain", "Film grain", "A fine grain over the picture."],
    ["motion", "Camera sway", "The view drifts a little with the pointer."],
    ["fps", "Frame rate", "Shows frames per second in the corner."],
  ];
  return (
    <div className="room-settings" role="dialog" aria-label="Settings">
      <div className="rs-head"><h2>Settings</h2><button onClick={onClose}>Close</button></div>
      <fieldset>
        <legend>Quality</legend>
        {(["auto", "full", "smooth"] as const).map((q) => (
          <label key={q}>
            <input type="radio" name="quality" checked={s.quality === q} onChange={() => set("quality", q)} />
            <span>{q === "auto" ? "Auto" : q === "full" ? "Full" : "Smooth"}</span>
            <small>{q === "auto" ? "Starts sharp, eases off if frames drag." : q === "full" ? "Always every pixel." : "Fewer pixels, steadier frames."}</small>
          </label>
        ))}
      </fieldset>
      {toggles.map(([k, label, note]) => (
        <label key={k} className="rs-toggle">
          <input type="checkbox" checked={Boolean(s[k])} onChange={(e) => set(k, e.target.checked as never)} />
          <span>{label}</span>
          <small>{note}</small>
        </label>
      ))}
      <p className="rs-note">Saved in this browser. <a href="?plain=1">Reading view</a> has everything as plain text.</p>
      <p className="rs-note">Hidden things found: {found} of {hidden}.</p>
    </div>
  );
}
