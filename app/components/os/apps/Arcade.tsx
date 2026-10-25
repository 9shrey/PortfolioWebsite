"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { breakout } from "./arcade/breakout";
import { runner } from "./arcade/runner";
import { snake } from "./arcade/snake";
import { best, record } from "./arcade/scores";
import { sound } from "./arcade/sound";
import { H, W, type Action, type Game, type GameInstance } from "./arcade/types";

/* The cabinet: pick a game, play it on a 320×240 screen, see your score.
   It owns the loop (fixed 60 Hz steps), the keyboard, the touch pad, the
   sound toggle and best scores; games only simulate and draw. */

const GAMES: Game[] = [snake, runner, breakout];

const KEYS: Record<string, Action> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
  " ": "fire",
  Enter: "fire",
};

type Phase = "menu" | "play" | "pause" | "over";

export default function Arcade() {
  const [phase, setPhase] = useState<Phase>("menu");
  const [sel, setSel] = useState(0);
  const [game, setGame] = useState<Game | null>(null);
  const [hud, setHud] = useState({ score: 0, stat: "" });
  const [result, setResult] = useState({ score: 0, best: 0, fresh: false });
  const [muted, setMuted] = useState(() => !sound.on);
  const [bests, setBests] = useState(() => GAMES.map((g) => best(g.id)));
  const [touch] = useState(() => window.matchMedia("(pointer: coarse)").matches);
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const inst = useRef<GameInstance | null>(null);
  const phaseRef = useRef<Phase>("menu");
  const [run, setRun] = useState(0);
  const screen = phase !== "menu";

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    root.current?.focus();
  }, []);

  const start = useCallback((g: Game) => {
    setGame(g);
    const over = () => {
      const score = inst.current?.score() ?? 0;
      const fresh = record(g.id, score);
      setResult({ score, best: best(g.id), fresh });
      setBests(GAMES.map((x) => best(x.id)));
      setPhase("over");
    };
    inst.current = g.create({ sfx: (n) => sound.play(n), over });
    sound.play("start");
    setHud({ score: 0, stat: "" });
    setRun((n) => n + 1);
    phaseRef.current = "play";
    setPhase("play");
    requestAnimationFrame(() => root.current?.focus());
  }, []);

  // The loop: fixed steps, draw every frame, HUD at ~10 Hz.
  useEffect(() => {
    if (!screen) return;
    const c = canvas.current;
    if (!c) return;
    const g = c.getContext("2d")!;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let hudT = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const it = inst.current;
      if (!it) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (phaseRef.current === "play" || phaseRef.current === "over") {
        acc += dt;
        while (acc >= 1 / 60) {
          it.step(1 / 60);
          acc -= 1 / 60;
        }
      }
      g.setTransform(2, 0, 0, 2, 0, 0);
      it.draw(g);
      hudT += dt;
      if (hudT > 0.1) {
        hudT = 0;
        setHud({ score: it.score(), stat: it.stat() });
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [run, screen]);

  const send = (a: Action, down: boolean) => {
    if (phaseRef.current === "play") inst.current?.input(a, down);
  };

  const onKey = (e: React.KeyboardEvent, down: boolean) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (phase === "menu") {
      if (!down) return;
      if (key === "ArrowDown" || key === "s") setSel((i) => (i + 1) % GAMES.length);
      else if (key === "ArrowUp" || key === "w") setSel((i) => (i - 1 + GAMES.length) % GAMES.length);
      else if (key === "Enter" || key === " ") start(GAMES[sel]);
      else return;
      e.preventDefault();
      return;
    }
    if (key === "Escape" || key === "p") {
      if (!down) return;
      // Esc pauses a running game instead of closing the window.
      if (phase === "play") {
        e.preventDefault();
        setPhase("pause");
      } else if (phase === "pause" && key === "p") setPhase("play");
      return;
    }
    if (phase === "pause" && down && (key === "Enter" || key === " ")) {
      e.preventDefault();
      setPhase("play");
      return;
    }
    if (phase === "over" && down && (key === "Enter" || key === " ")) {
      e.preventDefault();
      if (game) start(game);
      return;
    }
    const a = KEYS[key];
    if (!a) return;
    e.preventDefault();
    if (!e.repeat || !down) send(a, down);
  };

  // One set of handlers for the whole touch pad; each button names its action.
  const padAction = (e: React.PointerEvent) => (e.target as HTMLElement).closest<HTMLElement>("[data-action]")?.dataset.action as Action | undefined;

  // Swipes steer the snake; taps jump/launch.
  const swipe = useRef<{ x: number; y: number } | null>(null);

  return (
    <div
      ref={root}
      className="arc"
      tabIndex={0}
      aria-label="Arcade. Arrow keys to choose, Enter to play, Esc to pause."
      onKeyDown={(e) => onKey(e, true)}
      onKeyUp={(e) => onKey(e, false)}
    >
      <header className="arc-top">
        <span className="arc-brand">SHREY·ARCADE</span>
        {game && phase !== "menu" && (
          <span className="arc-hud">
            <span>
              SCORE <b>{hud.score}</b>
            </span>
            <span className="hide-sm">{hud.stat}</span>
            <span>
              BEST <b>{Math.max(best(game.id), hud.score)}</b>
            </span>
          </span>
        )}
        <button
          type="button"
          className="arc-mute"
          aria-pressed={!muted}
          aria-label={muted ? "Sound off" : "Sound on"}
          onClick={() => {
            sound.set(muted);
            setMuted(!muted);
          }}
        >
          {muted ? "♪ off" : "♪ on"}
        </button>
      </header>

      {phase === "menu" ? (
        <div className="arc-menu">
          <p className="arc-title">SELECT GAME</p>
          <ul role="listbox" aria-label="Games" aria-activedescendant={`arc-${GAMES[sel].id}`}>
            {GAMES.map((g, i) => (
              <li key={g.id} id={`arc-${g.id}`} role="option" aria-selected={i === sel}>
                <button
                  type="button"
                  className="arc-card"
                  onMouseEnter={() => setSel(i)}
                  onFocus={() => setSel(i)}
                  onClick={() => start(g)}
                >
                  <span className="arc-card-n">{i + 1}P</span>
                  <span className="arc-card-t">{g.title}</span>
                  <span className="arc-card-b">{g.blurb}</span>
                  <span className="arc-card-c">
                    {g.controls} · best <b>{bests[i]}</b>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="arc-blink">PRESS START</p>
        </div>
      ) : (
        <div className="arc-screen">
          <div
            className="arc-crt"
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              inst.current?.pointer?.(((e.clientX - r.left) / r.width) * W);
            }}
            onPointerDown={(e) => {
              swipe.current = { x: e.clientX, y: e.clientY };
              if (game?.id !== "snake") send("fire", true);
            }}
            onPointerUp={(e) => {
              if (game?.id !== "snake") send("fire", false);
              const s = swipe.current;
              swipe.current = null;
              if (!s || game?.id !== "snake") return;
              const dx = e.clientX - s.x;
              const dy = e.clientY - s.y;
              if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
              send(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up", true);
            }}
          >
            <canvas ref={canvas} width={W * 2} height={H * 2} aria-label={`${game?.title} game screen`} />
            {phase === "pause" && (
              <div className="arc-over">
                <p className="arc-title">PAUSED</p>
                <button type="button" onClick={() => setPhase("play")}>
                  Resume
                </button>
                <button type="button" onClick={() => setPhase("menu")}>
                  Quit to menu
                </button>
              </div>
            )}
            {phase === "over" && (
              <div className="arc-over">
                <p className="arc-title">{result.fresh ? "NEW HIGH SCORE" : "GAME OVER"}</p>
                <p className="arc-score">{result.score}</p>
                <p className="arc-dim">best {result.best}</p>
                <button type="button" onClick={() => game && start(game)}>
                  Play again
                </button>
                <button type="button" onClick={() => setPhase("menu")}>
                  Choose another game
                </button>
              </div>
            )}
          </div>
          {touch && phase === "play" && (
            <div
              className="arc-pad"
              aria-hidden
              onPointerDown={(e) => {
                const a = padAction(e);
                if (!a) return;
                e.preventDefault();
                (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
                send(a, true);
              }}
              onPointerUp={(e) => {
                const a = padAction(e);
                if (a) send(a, false);
              }}
              onPointerOut={(e) => {
                const a = padAction(e);
                if (a) send(a, false);
              }}
            >
              <div className="arc-dpad">
                <button type="button" className="u" data-action="up">▲</button>
                <button type="button" className="l" data-action="left">◀</button>
                <button type="button" className="r" data-action="right">▶</button>
                <button type="button" className="d" data-action="down">▼</button>
              </div>
              <button type="button" className="arc-a" data-action="fire">
                A
              </button>
            </div>
          )}
          <p className="arc-help hide-sm">
            {game?.controls} · Esc pause
          </p>
        </div>
      )}
    </div>
  );
}
