"use client";

import { useState } from "react";
import Crawl from "./cinema/Crawl";
import Popcorn from "./cinema/Popcorn";
import Quiz from "./cinema/Quiz";
import TrailerMaker from "./cinema/TrailerMaker";
import { favoriteGames, favoriteMovies, type Favourite } from "@/app/data/fun";

/* SHREY·PLEX: three screens (make a trailer, write a crawl, a movie quiz),
   a concession stand, and staff picks once app/data/fun.ts has some. */

type View = "lobby" | "trailer" | "crawl" | "quiz";

const SCREENS: { id: Exclude<View, "lobby">; n: string; title: string; blurb: string; cta: string; hue: number }[] = [
  { id: "trailer", n: "1", title: "Trailer Maker", blurb: "In a world where… you write the blockbuster. Hero, villain, genre, voice-over.", cta: "▶ Make a trailer", hue: 12 },
  { id: "crawl", n: "2", title: "Crawl Creator", blurb: "Your own space-opera opening, rolling off into the stars.", cta: "▶ Write a crawl", hue: 48 },
  { id: "quiz", n: "3", title: "Emoji Movie Quiz", blurb: "🦖🏝️🧬 = ? Guess the film, keep the streak alive.", cta: "▶ Play", hue: 200 },
];

function Shelf({ title, items }: { title: string; items: Favourite[] }) {
  if (!items.length) return null;
  return (
    <section className="cin-sec" aria-label={title}>
      <h3 className="cin-h">{title}</h3>
      <ul className="cin-shelf">
        {items.map((f) => (
          <li key={f.title}>
            <b>{f.title}</b>
            {f.note && <span>{f.note}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Cinema() {
  const [view, setView] = useState<View>("lobby");
  const back = () => setView("lobby");

  if (view === "trailer") return <TrailerMaker onExit={back} />;
  if (view === "crawl") return <Crawl onExit={back} />;
  if (view === "quiz") return <Quiz onExit={back} />;

  return (
    <div className="cin">
      <header className="cin-marquee">
        <span className="cin-bulbs" aria-hidden />
        <p className="cin-brand">SHREY·PLEX</p>
        <p className="cin-tag">three screens · free popcorn · no talking</p>
        <span className="cin-bulbs" aria-hidden />
      </header>

      <section className="cin-sec" aria-labelledby="cin-now">
        <h3 id="cin-now" className="cin-h">
          Now showing
        </h3>
        <div className="cin-screens">
          {SCREENS.map((s) => (
            <button key={s.id} type="button" className="cin-screen" style={{ "--h": s.hue } as React.CSSProperties} onClick={() => setView(s.id)}>
              <span className="cin-screen-n">SCREEN {s.n}</span>
              <span className="cin-screen-t">{s.title}</span>
              <span className="cin-screen-b">{s.blurb}</span>
              <span className="cin-screen-cta">{s.cta}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="cin-sec" aria-labelledby="cin-snacks">
        <h3 id="cin-snacks" className="cin-h">
          Concession stand
        </h3>
        <Popcorn />
      </section>

      <Shelf title="Staff picks: films" items={favoriteMovies} />
      <Shelf title="Staff picks: games" items={favoriteGames} />
    </div>
  );
}
