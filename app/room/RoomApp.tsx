"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DEFAULT_SETTINGS, RoomEngine, type Hit, type Settings } from "./engine/engine";
import { RoomAudio } from "./engine/audio";
import { drawCalendar } from "./engine/surfaces";
import { drawPhone, drawSlide } from "./engine/cards";
import LaptopScreen, { type Tab } from "./LaptopScreen";
import type { RoomContent, View } from "./types";

/* The page around the room: loading, three titles and two small controls. Everything else is in the
   room, to be found: work on the projector, the laptop (about, writing, online), the phone (contact),
   the résumé in its tray, the books on the shelf, the year on the wall. Nothing is labelled. The URL
   hash mirrors the view (#work/inferbench, #writing, ...). */

const NAV: { view: View; label: string }[] = [
  { view: { kind: "work", card: "" }, label: "Work" },
  { view: { kind: "writing" }, label: "Writing" },
  { view: { kind: "about" }, label: "About" },
];
const LAPTOP: View["kind"][] = ["about", "writing", "online"];
const LOADING = ["Opening the curtains", "Switching on the lamp", "Slotting the cards", "Pouring the chai", "Nearly there"];

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
  if (["about", "writing", "online", "contact", "year", "resume"].includes(k)) return { kind: k } as View;
  return { kind: "home" };
}

export default function RoomApp({ content, onFail }: { content: RoomContent; onFail(): void }) {
  const host = useRef<HTMLDivElement>(null);
  const engine = useRef<RoomEngine | null>(null);
  const audio = useRef<RoomAudio | null>(null);
  const [screenEl] = useState(() => document.createElement("div"));
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<View>({ kind: "home" });
  const [tab, setTab] = useState<Tab>("about");
  const [installed, setInstalled] = useState<string>(content.cards[0].id);
  const [sound, setSound] = useState(false);
  const [hint, setHint] = useState(true);
  const [settings, setSettings] = useState<Settings>(loadSettings);   // client-only component: localStorage is there
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fps, setFps] = useState(0);
  const [toast, setToast] = useState("");
  const [minute, setMinute] = useState(() => Math.floor(Date.now() / 60000));
  // on a phone the laptop's 1280 px app would be unreadably small on the lid: it opens full screen instead
  const [narrow] = useState(() => matchMedia("(max-width: 760px)").matches);

  const ci = content.cards.findIndex((c) => c.id === installed);
  const card = content.cards[ci] ?? null;

  const navigate = useCallback((v: View, push = true) => {
    const e = engine.current;
    if (v.kind === "work") {
      const id = v.card || installed;
      v = { kind: "work", card: id };
      e?.install(id);
    }
    if (v.kind === "about" || v.kind === "writing" || v.kind === "online") setTab(v.kind);
    setView(v);
    if (v.kind === "poster") e?.showPoster(v.i); else { e?.hidePoster(); e?.go(v); }
    e?.setScreenActive(LAPTOP.includes(v.kind));
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
        if (hit.kind === "view") return navigate(hit.view.kind === "about" && LAPTOP.includes(view.kind) ? view : hit.view);
        if (hit.kind === "action") return act(hit.action);
        if (hit.name.startsWith("poster_")) return navigate({ kind: "poster", i: Number(hit.name.slice(7)) });
        audio.current?.click(hit.name === "mug" ? "sip" : hit.name === "fan" ? "whirr" : hit.name === "lamp" ? "switch" : hit.name === "curtains" ? "swish" : "tick");
      },
    });
  }, [navigate, act, ready, view]);

  // the laptop's screen, once the room is up
  useEffect(() => {
    if (ready && host.current) engine.current?.attachScreen(host.current, screenEl);
  }, [ready, screenEl]);

  // the planner once fonts are in; the slide whenever the card changes
  useEffect(() => {
    if (!ready) return;
    document.fonts.ready.then(() => engine.current?.setSurface("calendar", drawCalendar(document.createElement("canvas"), content.year, content.goals)));
  }, [ready, content]);
  useEffect(() => {
    if (!ready) return;
    const n = content.cards.length;
    document.fonts.ready.then(() => {
      const d = drawSlide(card, content.cards[(ci - 1 + n) % n], content.cards[(ci + 1) % n], ci, n);
      engine.current?.setSurface("screen", d.canvas);
      engine.current?.setRegions("screen", d);
    });
  }, [ready, card, ci, content]);

  // the phone: a lock screen lying on the desk, the contact card when it's picked up
  useEffect(() => {
    const t = setInterval(() => setMinute(Math.floor(Date.now() / 60000)), 15000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const open = view.kind === "contact";
    document.fonts.ready.then(() => {
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
  const navOn = (k: View["kind"]) => k === view.kind || (k === "about" && view.kind === "online");

  return (
    <div ref={host} className={`room ${ready ? "is-ready" : ""} view-${view.kind}`}>
      <p className="sr-only">A desk at night by a rainy window in New York. Things on the desk and around the room open what they hold; the reading view has all of it as plain text.</p>

      <div className={`room-loader ${ready ? "is-done" : ""}`} aria-hidden={ready} style={{ ["--p" as string]: progress }}>
        {/* the room itself, out of focus, coming into focus as it loads */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="loader-still" src="/room/still.webp" alt="" />
        <div className="loader-foot">
          <p className="loader-name">{content.name}</p>
          <p className="loader-step">{LOADING[Math.min(LOADING.length - 1, Math.floor(progress * LOADING.length))]}</p>
          <div className="loader-bar"><span /></div>
        </div>
      </div>

      <header className="room-head">
        <button className="room-name" onClick={() => navigate({ kind: "home" })}>
          <span className="n">{content.name}</span>
          <span className="t">{content.title}, {content.location.split(",")[0]}</span>
        </button>
        <nav className="room-nav" aria-label="Sections">
          {NAV.map((n) => (
            <a key={n.label} href={toHash(n.view)} aria-current={navOn(n.view.kind) ? "page" : undefined}
              onClick={(e) => { e.preventDefault(); navigate(n.view); }}>
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

      {settingsOpen && <SettingsPanel s={settings} onChange={changeSettings} onClose={() => setSettingsOpen(false)} />}
      {settings.fps && ready && <p className="room-fps" aria-hidden>{fps} fps</p>}

      {ready && hint && atHome && <p className="room-hint">Have a look around.</p>}

      {!atHome && (
        <button className="room-back" onClick={() => navigate({ kind: "home" })}>Back <kbd>Esc</kbd></button>
      )}
      {toast && <p className="room-toast" role="status">{toast}</p>}

      {createPortal(<LaptopScreen c={content} tab={tab} onTab={(t) => navigate({ kind: t })} />, screenEl)}
      {narrow && LAPTOP.includes(view.kind) && (
        <div className="lap-full"><LaptopScreen c={content} tab={tab} onTab={(t) => navigate({ kind: t })} /></div>
      )}
    </div>
  );
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
      <p className="rs-note">Saved in this browser. <a href="?plain=1">Reading view</a> has everything as plain text.</p>
    </div>
  );
}
