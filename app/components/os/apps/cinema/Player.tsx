"use client";

import { useEffect, useState, type ReactNode } from "react";
import Backdrop, { type Look } from "./Backdrop";
import { sound } from "../arcade/sound";
import type { Sfx } from "../arcade/types";

/* A letterboxed scene player: auto-advances, play/pause, skip, a scrubber
   made of the scenes. Used by the Trailer Maker. Optional voice-over reads
   each scene's `say` with the browser's own speech synthesis. */

export interface Scene {
  ms: number;
  kind: string;
  say?: string;
  body: ReactNode;
  /** 0..1: how hard the backdrop goes during this scene. */
  energy?: number;
  /** A hit on the cut (uses the Arcade's sound toggle). */
  sfx?: Sfx;
  /** Cut effect: a white flash, or a camera shake. */
  fx?: "flash" | "shake";
}

function speak(text: string) {
  try {
    const s = window.speechSynthesis;
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.82;
    u.pitch = 0.3;
    s.speak(u);
  } catch {}
}

export default function Player({
  scenes,
  voice,
  onExit,
  extra,
  look,
}: {
  scenes: Scene[];
  voice: boolean;
  onExit: () => void;
  extra?: ReactNode;
  look?: Look;
}) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const scene = scenes[i];
  const done = i === scenes.length - 1;

  useEffect(() => {
    if (!playing || done) return;
    const id = window.setTimeout(() => setI((n) => Math.min(n + 1, scenes.length - 1)), scene.ms);
    return () => window.clearTimeout(id);
  }, [i, playing, done, scene.ms, scenes.length]);

  useEffect(() => {
    if (voice && playing && scene.say) speak(scene.say);
  }, [i, voice, playing, scene.say]);

  useEffect(() => {
    if (playing && scene.sfx) sound.play(scene.sfx);
  }, [i, playing, scene.sfx]);

  useEffect(
    () => () => {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    },
    []
  );

  return (
    <div
      className="cin-player"
      onKeyDown={(e) => {
        if (e.key === " ") {
          e.preventDefault();
          setPlaying((v) => !v);
        } else if (e.key === "ArrowRight") setI((n) => Math.min(n + 1, scenes.length - 1));
        else if (e.key === "ArrowLeft") setI((n) => Math.max(n - 1, 0));
      }}
    >
      <div className={`cin-stage${look ? ` look-${look}` : ""}`} aria-live="polite">
        {look && <Backdrop look={look} energy={scene.energy ?? 0.2} />}
        <div className={`cin-cam${scene.fx === "shake" ? " shake" : ""}`} key={i}>
          <div className={`cin-scene cin-k-${scene.kind}`} style={{ "--dur": `${scene.ms}ms` } as React.CSSProperties}>
            {scene.body}
          </div>
        </div>
        {scene.fx === "flash" && <div className="cin-flash" key={`f${i}`} aria-hidden />}
        <div className="cin-vignette" aria-hidden />
        <div className="cin-grain" aria-hidden />
      </div>
      <div className="cin-controls">
        <button type="button" className="cin-btn" onClick={onExit}>
          ← Back
        </button>
        <button type="button" className="cin-btn" onClick={() => setI((n) => Math.max(n - 1, 0))} aria-label="Previous scene">
          ⏮
        </button>
        <button
          type="button"
          className="cin-btn cin-play"
          onClick={() => (done ? (setI(0), setPlaying(true)) : setPlaying((v) => !v))}
          aria-label={done ? "Replay" : playing ? "Pause" : "Play"}
        >
          {done ? "↺" : playing ? "❚❚" : "▶"}
        </button>
        <button type="button" className="cin-btn" onClick={() => setI((n) => Math.min(n + 1, scenes.length - 1))} aria-label="Next scene">
          ⏭
        </button>
        <ol className="cin-scrub" aria-label="Scenes">
          {scenes.map((s, k) => (
            <li key={k}>
              <button
                type="button"
                aria-label={`Scene ${k + 1}`}
                aria-current={k === i || undefined}
                className={k < i ? "past" : k === i ? (playing && !done ? "now run" : "now") : ""}
                style={{ "--dur": `${s.ms}ms` } as React.CSSProperties}
                onClick={() => setI(k)}
              />
            </li>
          ))}
        </ol>
        {extra}
      </div>
    </div>
  );
}
