"use client";

import { useEffect, useRef, useState } from "react";
import { unlock } from "../../achievements";
import { sound } from "../arcade/sound";

/* The concession stand. Looks like a toy; it's the visitor counter. The
   pile in the glass grows with the number of visitors (from /api/visits),
   and after enough pops a ticket spills the secret. */

type Pop = { id: number; x: number; dx: number; h: number; r: number };
const REVEAL_AT = 12;

export default function Popcorn() {
  const [visitors, setVisitors] = useState<number | null | undefined>(undefined);
  const [popped, setPopped] = useState(0);
  const [pops, setPops] = useState<Pop[]>([]);
  const id = useRef(0);
  const revealed = popped >= REVEAL_AT;

  useEffect(() => {
    fetch("/api/visits", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { count: null }))
      .then((d: { count: number | null }) => setVisitors(d.count))
      .catch(() => setVisitors(null));
  }, []);

  useEffect(() => {
    if (revealed && visitors != null) unlock("popcorn");
  }, [revealed, visitors]);

  const pop = () => {
    const n = 3 + Math.floor(Math.random() * 4);
    const fresh = Array.from({ length: n }, () => ({
      id: ++id.current,
      x: 35 + Math.random() * 30,
      dx: (Math.random() - 0.5) * 160,
      h: 60 + Math.random() * 90,
      r: (Math.random() - 0.5) * 720,
    }));
    setPops((p) => [...p.slice(-40), ...fresh]);
    window.setTimeout(() => setPops((p) => p.filter((x) => !fresh.includes(x))), 1100);
    sound.play(popped + 1 === REVEAL_AT ? "bonus" : "brick");
    setPopped((c) => c + 1);
  };

  // The pile: one 🍿 per order of magnitude-ish, so it visibly grows.
  const pile = visitors ? Math.min(24, Math.max(1, Math.round(Math.log2(visitors + 1) * 2))) : 1;

  return (
    <div className="cin-pop">
      <button type="button" className="cin-machine" onClick={pop} aria-label="Pop some popcorn">
        <span className="cin-machine-sign">POPCORN</span>
        <span className="cin-machine-glass" aria-hidden>
          {pops.map((p) => (
            <span
              key={p.id}
              className="cin-kernel"
              style={{ left: `${p.x}%`, "--dx": `${p.dx}px`, "--h": `${p.h}px`, "--r": `${p.r}deg` } as React.CSSProperties}
            >
              🍿
            </span>
          ))}
          <span className="cin-machine-pile">{"🍿".repeat(pile)}</span>
        </span>
        <span className="cin-machine-cta">{revealed ? "fresh batch" : "press to pop"}</span>
      </button>
      <div className="cin-pop-side" aria-live="polite">
        {!revealed ? (
          <p className="cin-pop-hint">Free refills. {popped > 4 ? "Keep going…" : "Go on, press it."}</p>
        ) : visitors != null ? (
          <div className="cin-ticket">
            <span className="cin-ticket-k">ADMIT ONE · SECRET</span>
            <p>Every kernel in this machine is a visitor.</p>
            <p className="cin-ticket-n">
              <b>{visitors.toLocaleString("en-IN")}</b> {visitors === 1 ? "person has" : "people have"} dropped by.
            </p>
            <p className="cin-ticket-s">You&apos;re one of them. Thanks for stopping in. 🍿</p>
          </div>
        ) : (
          <div className="cin-ticket">
            <span className="cin-ticket-k">ADMIT ONE · SECRET</span>
            <p>Every kernel here stands for a visitor… but the counter is on its break right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
