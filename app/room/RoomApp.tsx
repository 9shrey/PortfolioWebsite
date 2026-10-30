"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_SETTINGS, RoomEngine, type Hit, type Settings } from "./engine/engine";
import { RoomAudio } from "./engine/audio";
import { drawCalendar } from "./engine/surfaces";
import { drawPhone } from "./engine/cards";
import { Reel } from "./engine/reel";
import { Terminal, type TermPage } from "./engine/terminal";
import type { RoomContent, View } from "./types";

/* The page around the room: loading, three titles and two small controls. Everything else is in the
   room, to be found: the old monitor (about, work, writing, online; the GPU cards on the bench open
   their project there), the projector looping visuals, the phone (contact),
   the résumé in its tray, the books on the shelf, the year on the wall. Nothing is labelled. The URL
   hash mirrors the view (#work/inferbench, #writing, ...). */

/* Writing is the one section that leaves the room: it is its own pages, as on Felix's site. */
const NAV: { view: View | null; href: string; label: string }[] = [
  { view: { kind: "work", card: "" }, href: "#work", label: "Work" },
  { view: null, href: "/writing", label: "Writing" },
  { view: { kind: "about" }, href: "#about", label: "About" },
];
const TERM: View["kind"][] = ["about", "work", "writing", "online", "terminal"];
const LOADING = ["Opening the curtains", "Switching on the lamp", "Slotting the cards", "Pouring the chai", "Warming up the tube"];

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
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<View>({ kind: "home" });
  const [installed, setInstalled] = useState<string>(content.cards[0].id);
  const [sound, setSound] = useState(false);
  const [hint, setHint] = useState(true);
  const [settings, setSettings] = useState<Settings>(loadSettings);   // client-only component: localStorage is there
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fps, setFps] = useState(0);
  const [toast, setToast] = useState("");
  const [minute, setMinute] = useState(() => Math.floor(Date.now() / 60000));
  // on a phone 48 columns on a tube across the room would be unreadable: the terminal fills the screen instead
  const [narrow] = useState(() => matchMedia("(max-width: 760px)").matches);

  const navigate = useCallback((v: View, push = true) => {
    const e = engine.current;
    if (v.kind === "work") {
      v = { kind: "work", card: v.card ?? "" };
      if (v.card) e?.install(v.card);
    }
    const t = term.current;
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

  const step = useCallback((dir: 1 | -1) => {
    const cur = view.kind === "work" && view.card ? view.card : installed;
    const i = content.cards.findIndex((c) => c.id === cur);
    const next = content.cards[(i + dir + content.cards.length) % content.cards.length];
    navigate({ kind: "work", card: next.id });
  }, [view, installed, content, navigate]);

  // what a link drawn in the room does
  const act = useCallback((action: string) => {
    const [kind, ...rest] = action.split(":"); const arg = rest.join(":");
    audio.current?.click("tick");
    if (kind === "href") location.href = arg;
    else if (kind === "ext") { if (arg.startsWith("mailto:")) location.href = arg; else window.open(arg, "_blank", "noopener"); }
    else if (kind === "copy") { navigator.clipboard?.writeText(arg); setToast("Copied"); setTimeout(() => setToast(""), 1600); }
    else if (kind === "card") step(arg === "next" ? 1 : -1);
    else if (kind === "work") navigate({ kind: "work", card: arg });
    else if (kind === "term") navigate((arg === "work" ? { kind: "work", card: "" } : { kind: arg === "menu" ? "terminal" : arg }) as View);
  }, [step, navigate]);
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
        if (hit.kind === "view") return navigate(TERM.includes(hit.view.kind) && TERM.includes(view.kind) ? view : hit.view);
        if (hit.kind === "action") return act(hit.action);
        if (hit.name.startsWith("poster_")) return navigate({ kind: "poster", i: Number(hit.name.slice(7)) });
        audio.current?.click(hit.name === "mug" ? "sip" : hit.name === "fan" ? "whirr" : hit.name === "lamp" ? "switch" : hit.name === "curtains" ? "swish" : "tick");
      },
    });
  }, [navigate, act, ready, view]);

  // the old monitor's terminal: drawn when it changes (and through the boot), on the tube and, on a phone, full screen
  useEffect(() => {
    if (!ready) return;
    const t = new Terminal(content, (a) => actRef.current(a));
    term.current = t;
    if (process.env.NODE_ENV !== "production") (window as unknown as { __term: Terminal }).__term = t;
    let raf = 0;
    const paint = () => {
      raf = requestAnimationFrame(paint);
      if (!t.draw(performance.now() / 1000)) return;
      engine.current?.setSurface("crt_screen", t.canvas);
      engine.current?.setRegions("crt_screen", t.regions());
      const v = termView.current;
      if (v) { v.width = t.canvas.width; v.height = t.canvas.height; v.getContext("2d")!.drawImage(t.canvas, 0, 0); }
    };
    document.fonts.ready.then(() => { t.dirty = true; paint(); });
    const tick = setInterval(() => { t.dirty = true; }, 20000);   // the clock in its status bar
    engine.current?.setCrtPower(false);
    return () => { cancelAnimationFrame(raf); clearInterval(tick); term.current = null; };
  }, [ready, content]);
  const actRef = useRef<(a: string) => void>(() => {});

  // the planner once fonts are in
  useEffect(() => {
    if (!ready) return;
    document.fonts.ready.then(() => engine.current?.setSurface("calendar", drawCalendar(document.createElement("canvas"), content.year, content.goals)));
  }, [ready, content]);
  // the projector: a reel of generative pieces on a loop, at 30 frames a second (slowed right down for reduced motion)
  useEffect(() => {
    if (!ready) return;
    const reel = new Reel();
    const slow = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0.08 : 1;
    let raf = 0, last = 0;
    const paint = (now: number) => {
      raf = requestAnimationFrame(paint);
      if (now - last < 1000 / 30) return;
      last = now;
      reel.draw((now / 1000) * slow);
      engine.current?.setSurface("screen", reel.canvas);
    };
    raf = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf);
  }, [ready]);

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

  // keys: Esc goes back; at the monitor they go to its terminal
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.target instanceof HTMLInputElement || ev.metaKey || ev.ctrlKey) return;
      if (ev.key === "Escape") { setSettingsOpen(false); navigate({ kind: "home" }); return; }
      // at the monitor, keys go to its terminal; Q on its menu gets up from the desk
      const t = term.current;
      if (t && TERM.includes(view.kind)) {
        if ((ev.key === "q" || ev.key === "Q") && t.page === "menu") { navigate({ kind: "home" }); return; }
        if (t.key(ev)) { ev.preventDefault(); audio.current?.click("key"); }
        const k: Record<TermPage, View> = {
          boot: { kind: "terminal" }, menu: { kind: "terminal" }, about: { kind: "about" }, writing: { kind: "writing" }, online: { kind: "online" },
          work: { kind: "work", card: "" }, project: { kind: "work", card: t.card },
        };
        const want = k[t.page];
        if (toHash(want) !== toHash(view)) {
          if (want.kind === "work" && want.card) engine.current?.install(want.card);
          setView(want); history.replaceState(null, "", toHash(want) || location.pathname + location.search);
        }
        return;
      }
    };
    const onWheel = (ev: WheelEvent) => { if (TERM.includes(view.kind) && !(ev.target as Element).closest?.(".room-settings")) term.current?.wheel(ev.deltaY); };
    addEventListener("keydown", onKey);
    addEventListener("wheel", onWheel, { passive: true });
    return () => { removeEventListener("keydown", onKey); removeEventListener("wheel", onWheel); };
  }, [navigate, view]);

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
  const navOn = (k: View["kind"]) => k === view.kind || (k === "about" && TERM.includes(view.kind) && view.kind !== "work");

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

      {settingsOpen && <SettingsPanel s={settings} onChange={changeSettings} onClose={() => setSettingsOpen(false)} />}
      {settings.fps && ready && <p className="room-fps" aria-hidden>{fps} fps</p>}

      {ready && hint && atHome && <p className="room-hint">Have a look around.</p>}

      {!atHome && (
        <button className="room-back" onClick={() => navigate({ kind: "home" })}>Back to the desk <kbd>· Esc</kbd></button>
      )}
      {toast && <p className="room-toast" role="status">{toast}</p>}

      {narrow && TERM.includes(view.kind) && (
        <div className="term-full">
          <canvas ref={termView} className="term-tube" aria-label="Terminal. Tap a line to open it."
            onClick={(e) => {
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
