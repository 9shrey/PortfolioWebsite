"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_SETTINGS, RoomEngine, type Hit, type Settings } from "./engine/engine";
import { RoomAudio } from "./engine/audio";
import { drawCalendar } from "./engine/surfaces";
import { drawAbout, drawBooks, drawContact, drawResume, drawSlide, drawWriting, type Drawn } from "./engine/cards";
import type { RoomContent, View } from "./types";

/* The page around the room: loading, the nav and what the pointer is over. Everything you read is
   inside the room: the projector's slide for work, the wall planner for the year, and paper cards
   that float up off the desk for the rest. The URL hash mirrors the view (#work/inferbench, #about). */

/** Views that are a card floating up, and the thing on the desk it comes from. */
const CARD_FROM: Partial<Record<View["kind"], string>> = { about: "badge", writing: "notebook", contact: "phone", resume: "resume", books: "book_0" };

let resumeImg: HTMLImageElement | null = null;
function resumePage(): Promise<HTMLImageElement | null> {
  if (resumeImg) return Promise.resolve(resumeImg);
  return new Promise((ok) => { const i = new Image(); i.onload = () => ok((resumeImg = i)); i.onerror = () => ok(null); i.src = "/room/labels/resume.png"; });
}

const NAV: { view: View; label: string }[] = [
  { view: { kind: "work", card: "" }, label: "Work" },
  { view: { kind: "about" }, label: "About" },
  { view: { kind: "writing" }, label: "Writing" },
  { view: { kind: "books" }, label: "Books" },
  { view: { kind: "year" }, label: "Year" },
  { view: { kind: "contact" }, label: "Contact" },
];

const SETTINGS_KEY = "room.settings";
function loadSettings(): Settings {
  try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") }; } catch { return DEFAULT_SETTINGS; }
}

function toHash(v: View) {
  if (v.kind === "home") return "";
  if (v.kind === "work") return v.card ? `#work/${v.card}` : "#work";
  if (v.kind === "books") return v.book !== undefined ? `#books/${v.book}` : "#books";
  return `#${v.kind}`;
}
function fromHash(h: string, content: RoomContent): View {
  const [k, id] = h.replace(/^#/, "").split("/");
  if (k === "work") return { kind: "work", card: content.cards.some((c) => c.id === id) ? id : "" };
  if (k === "books") return { kind: "books", book: id !== undefined && content.books[Number(id)] ? Number(id) : undefined };
  if (["about", "writing", "contact", "year", "resume"].includes(k)) return { kind: k } as View;
  return { kind: "home" };
}

export default function RoomApp({ content, onFail }: { content: RoomContent; onFail(): void }) {
  const host = useRef<HTMLDivElement>(null);
  const engine = useRef<RoomEngine | null>(null);
  const audio = useRef<RoomAudio | null>(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<View>({ kind: "home" });
  const [installed, setInstalled] = useState<string>(content.cards[0].id);
  const [hover, setHover] = useState<{ label: string; x: number; y: number } | null>(null);
  const [sound, setSound] = useState(false);
  const [hint, setHint] = useState(true);
  const [settings, setSettings] = useState<Settings>(loadSettings);   // client-only component: localStorage is there
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fps, setFps] = useState(0);
  const [toast, setToast] = useState("");

  const ci = content.cards.findIndex((c) => c.id === installed);
  const card = content.cards[ci] ?? null;

  const navigate = useCallback((v: View, push = true) => {
    const e = engine.current;
    if (v.kind === "work") {
      const id = v.card || installed;
      v = { kind: "work", card: id };
      e?.install(id);
    }
    setView(v);
    // cards float up where you are; the projector and the planner are walked up to
    e?.go(CARD_FROM[v.kind] ? { kind: "home" } : v);
    if (!CARD_FROM[v.kind]) e?.hideCard();
    setHint(false);
    const h = toHash(v);
    if (push && location.hash !== h) history.pushState(null, "", h || location.pathname + location.search);
  }, [installed]);

  const step = useCallback((dir: 1 | -1) => {
    const next = content.cards[(ci + dir + content.cards.length) % content.cards.length];
    navigate({ kind: "work", card: next.id });
  }, [ci, content, navigate]);

  // what a link drawn in the room does
  const act = useCallback((action: string) => {
    const [kind, ...rest] = action.split(":"); const arg = rest.join(":");
    audio.current?.click("tick");
    if (kind === "href") location.href = arg;
    else if (kind === "ext") { if (arg.startsWith("mailto:")) location.href = arg; else window.open(arg, "_blank", "noopener"); }
    else if (kind === "copy") { navigator.clipboard?.writeText(arg); setToast("Copied"); setTimeout(() => setToast(""), 1600); }
    else if (kind === "card") step(arg === "next" ? 1 : -1);
  }, [step]);

  // engine
  useEffect(() => {
    if (!host.current) return;
    let alive = true;
    const e = new RoomEngine(host.current, {
      progress: (p) => alive && setProgress(p),
      ready: () => alive && setReady(true),
      hover: (hit, x, y) => setHover(hit ? { label: labelOf(hit, content), x, y } : null),
      installed: (id) => { setInstalled(id); audio.current?.click("card"); },
      key: () => audio.current?.click("key"),
      fps: (f) => alive && setFps(f),
    });
    engine.current = e;
    if (process.env.NODE_ENV !== "production") (window as unknown as { __room: RoomEngine }).__room = e;
    e.load().catch((err) => { console.error(err); onFail(); });
    audio.current = new RoomAudio();
    return () => { alive = false; e.dispose(); audio.current?.dispose(); engine.current = null; };
  }, [content, onFail]);

  // clicks in the room
  useEffect(() => {
    engine.current?.setEvents({
      click: (hit: Hit) => {
        if (hit.kind === "card") return navigate({ kind: "work", card: hit.id });
        if (hit.kind === "view") return navigate(hit.view);
        if (hit.kind === "action") return act(hit.action);
        audio.current?.click(hit.name === "mug" ? "sip" : hit.name === "fan" ? "whirr" : "tick");
      },
    });
  }, [navigate, act, ready]);

  // the planner once fonts are in; the slide whenever the card changes
  useEffect(() => {
    if (!ready) return;
    document.fonts.ready.then(() => engine.current?.setSurface("calendar", drawCalendar(document.createElement("canvas"), content.year, content.goals)));
  }, [ready, content]);
  useEffect(() => {
    if (!ready) return;
    const n = content.cards.length;
    document.fonts.ready.then(() => {
      const d = drawSlide(card, content.cards[(ci - 1 + n) % n], content.cards[(ci + 1) % n]);
      engine.current?.setSurface("screen", d.canvas);
      engine.current?.setRegions("screen", d);
    });
  }, [ready, card, ci, content]);

  // the card for the current view
  useEffect(() => {
    if (!ready) return;
    const from = CARD_FROM[view.kind];
    if (!from) return;
    let live = true;
    (async () => {
      await document.fonts.ready;
      let d: Drawn;
      if (view.kind === "about") d = drawAbout(content);
      else if (view.kind === "writing") d = drawWriting(content);
      else if (view.kind === "contact") d = drawContact(content);
      else if (view.kind === "resume") d = drawResume(content, await resumePage());
      else if (view.kind === "books") d = drawBooks(content.books, view.book);
      else return;
      if (live) engine.current?.showCard(d, view.kind === "books" && view.book !== undefined ? `book_${view.book}` : from);
    })();
    return () => { live = false; };
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

  // keys: Esc goes back, arrows step through the work
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.target instanceof HTMLInputElement || ev.metaKey || ev.ctrlKey) return;
      if (ev.key === "Escape") { setSettingsOpen(false); navigate({ kind: "home" }); }
      if (view.kind === "work" && (ev.key === "ArrowRight" || ev.key === "ArrowLeft")) step(ev.key === "ArrowRight" ? 1 : -1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [navigate, step, view]);

  // settings: remembered in this browser
  useEffect(() => {
    if (ready) engine.current?.setSettings(settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
  const changeSettings = (s: Settings) => {
    setSettings(s); engine.current?.setSettings(s);
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {}
  };

  const toggleSound = async () => {
    const a = audio.current!;
    if (a.on) { a.stop(); setSound(false); } else { await a.start(); setSound(true); }
  };

  const atHome = view.kind === "home";

  return (
    <div ref={host} className={`room ${ready ? "is-ready" : ""} view-${view.kind}`}>
      <p className="sr-only">A desk at night by a rainy window in New York. Everything on the desk opens something; the menu at the top goes to the same places, and the reading view has all of it as text.</p>

      <div className={`room-loader ${ready ? "is-done" : ""}`} aria-hidden={ready}>
        <p className="loader-name">{content.name}</p>
        <div className="loader-bar"><span style={{ transform: `scaleX(${progress})` }} /></div>
        <p className="loader-note">Setting up the desk</p>
      </div>

      <header className="room-head">
        <button className="room-name" onClick={() => navigate({ kind: "home" })}>
          <span className="n">{content.name}</span>
          <span className="t">{content.title}, {content.location.split(",")[0]}</span>
        </button>
        <nav className="room-nav" aria-label="Rooms of the site">
          {NAV.map((n) => (
            <a key={n.label} href={toHash(n.view)} aria-current={view.kind === n.view.kind ? "page" : undefined}
              onClick={(e) => { e.preventDefault(); navigate(n.view); }}>
              {n.label}
            </a>
          ))}
          <button className="room-settings-btn" onClick={() => setSettingsOpen((o) => !o)} aria-expanded={settingsOpen}>Settings</button>
          <button className="room-sound" onClick={toggleSound} aria-pressed={sound}>
            {sound ? "Sound on" : "Sound off"}
          </button>
          <a className="room-plain" href="?plain=1">Reading view</a>
        </nav>
      </header>

      {settingsOpen && <SettingsPanel s={settings} onChange={changeSettings} onClose={() => setSettingsOpen(false)} />}
      {settings.fps && ready && <p className="room-fps" aria-hidden>{fps} fps</p>}

      {hover && hover.label && (
        <div className="room-tip" style={{ left: hover.x, top: hover.y }}>{hover.label}</div>
      )}

      {ready && hint && atHome && (
        <p className="room-hint">The cards on the desk are my work. Push the pointer to an edge to look around.</p>
      )}

      {!atHome && (
        <button className="room-back" onClick={() => navigate({ kind: "home" })}>Back to the desk <kbd>Esc</kbd></button>
      )}
      {toast && <p className="room-toast" role="status">{toast}</p>}
    </div>
  );
}

function labelOf(hit: Hit, c: RoomContent) {
  if (hit.kind === "card") return c.cards.find((x) => x.id === hit.id)?.title.split(":")[0] ?? "";
  if (hit.kind === "view" && hit.label.startsWith("book:")) {
    const b = c.books[Number(hit.label.slice(5))];
    return b ? `${b.title}, ${b.author}` : "";
  }
  if (hit.kind === "view") return hit.label;
  return hit.label;
}

function SettingsPanel({ s, onChange, onClose }: { s: Settings; onChange(s: Settings): void; onClose(): void }) {
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
      <p className="rs-note">Saved in this browser.</p>
    </div>
  );
}
