"use client";

import { useState } from "react";
import Player, { type Scene } from "./Player";
import type { Look } from "./Backdrop";
import { unlock } from "../../achievements";

/* Mad-libs for movie trailers. Cast a hero and a villain, name the
   problem, pick a genre (or roll everything), and it cuts a trailer with
   every cliché: studio ident, voice-over, a quick-cut montage, the big
   line, and a title card dressed for the genre. */

const GENRES: Record<
  Look,
  { label: string; tag: string; rating: string; when: string; montage: [string, string, string]; studio: string }
> = {
  action: {
    label: "Action",
    tag: "This summer, there will be no second take.",
    rating: "Rated R for Relentless Explosions",
    when: "Coming this summer",
    montage: ["No rules.", "No backup.", "No brakes."],
    studio: "BIG EXPLOSION PICTURES",
  },
  horror: {
    label: "Horror",
    tag: "Don't. Open. The. Fridge.",
    rating: "Rated R for Really Scary Leftovers",
    when: "Coming this Halloween",
    montage: ["Don't look.", "Don't listen.", "Don't blink."],
    studio: "MIDNIGHT FOG FILMS",
  },
  romcom: {
    label: "Rom-com",
    tag: "Love was never in the plan. Neither was any of this.",
    rating: "Rated PG for Persistent Gazing",
    when: "Coming this Valentine's",
    montage: ["One meet-cute.", "Two misunderstandings.", "Zero chill."],
    studio: "HEART EYES STUDIOS",
  },
  scifi: {
    label: "Sci-fi",
    tag: "In space, no one can hear you debug.",
    rating: "Rated PG-13 for Paradoxes",
    when: "Coming in the year 3000",
    montage: ["Beyond the stars.", "Beyond time.", "Beyond Wi-Fi range."],
    studio: "WARP DRIVE PICTURES",
  },
  heist: {
    label: "Heist",
    tag: "One last job. Again.",
    rating: "Rated PG-13 for Elaborate Plans",
    when: "Coming soon-ish",
    montage: ["One vault.", "One crew.", "One very long plan."],
    studio: "SMOOTH OPERATOR FILMS",
  },
};

const HEROES = ["🦸", "🐶", "🧙", "👵", "🐉", "🤠", "🐱", "🧑‍🍳", "🥷", "🤖"];
const VILLAINS = ["🦹", "🐦", "👻", "📊", "🦈", "👽", "🧟", "🐍", "🤡", "🦑"];

const POOL = {
  hero: ["a retired barista", "one tired intern", "a golden retriever", "the last honest plumber", "a substitute teacher", "a very small dragon", "two rival chefs", "a grandmother with a past"],
  problem: [
    "the Wi-Fi went down forever",
    "every cat became mayor",
    "Mondays happen twice a week",
    "the moon was slightly to the left",
    "nobody could find the TV remote",
    "pizza was outlawed",
    "the printer finally became sentient",
    "socks started disappearing in pairs",
  ],
  villain: ["a shadowy HOA", "an army of pigeons", "a sentient spreadsheet", "their evil twin", "the group chat", "a very polite ghost", "Gary from accounting", "a mysterious seagull"],
  title: ["LAST CALL", "THE REMOTE", "NO SECOND TAKE", "PIGEONFALL", "OUT OF OFFICE", "THE LEFT MOON", "FINAL BOSS", "LOW BATTERY"],
};

const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type Form = { hero: string; heroE: string; problem: string; villain: string; villainE: string; title: string; genre: Look };

function build(f: Form): Scene[] {
  const g = GENRES[f.genre];
  return [
    {
      kind: "studio",
      ms: 3000,
      energy: 0.1,
      sfx: "start",
      body: (
        <>
          <p className="cin-studio">{g.studio}</p>
          <p className="cin-presents">in association with SHREY·PLEX</p>
        </>
      ),
    },
    {
      kind: "line",
      ms: 4000,
      energy: 0.25,
      say: `In a world where ${f.problem}.`,
      body: (
        <>
          <p className="cin-kicker">In a world where…</p>
          <p className="cin-line">{f.problem}.</p>
        </>
      ),
    },
    {
      kind: "cast",
      ms: 3800,
      energy: 0.35,
      sfx: "jump",
      say: `One ${f.hero.replace(/^(a|an|one|the)\s+/i, "")}`,
      body: (
        <>
          <p className="cin-kicker">One hero…</p>
          <p className="cin-avatar" aria-hidden>
            {f.heroE}
          </p>
          <p className="cin-line">{cap(f.hero)}</p>
        </>
      ),
    },
    {
      kind: "cast-bad",
      ms: 3800,
      energy: 0.75,
      sfx: "hit",
      fx: "shake",
      say: `must face ${f.villain}.`,
      body: (
        <>
          <p className="cin-kicker">…must face</p>
          <p className="cin-avatar cin-avatar-bad" aria-hidden>
            {f.villainE}
          </p>
          <p className="cin-line cin-villain">{f.villain}</p>
        </>
      ),
    },
    {
      kind: "montage",
      ms: 2700,
      energy: 0.9,
      sfx: "eat",
      say: g.montage.join(" "),
      body: (
        <div className="cin-cuts">
          {g.montage.map((m, k) => (
            <p key={m} style={{ animationDelay: `${k * 850}ms` }}>
              {m}
            </p>
          ))}
        </div>
      ),
    },
    {
      kind: "boom",
      ms: 3600,
      energy: 1,
      sfx: "die",
      fx: "flash",
      say: g.tag,
      body: <p className="cin-boom">{g.tag}</p>,
    },
    {
      kind: "title",
      ms: 8000,
      energy: 0.6,
      sfx: "level",
      fx: "flash",
      say: f.title,
      body: (
        <>
          <p className="cin-billing">
            {f.heroE} {cap(f.hero)} &nbsp;·&nbsp; {f.villainE} {cap(f.villain)}
          </p>
          <p className={`cin-title t-${f.genre}`}>{f.title}</p>
          <p className="cin-sub">A {g.label.toLowerCase()} film</p>
          <p className="cin-now">{g.when}</p>
          <p className="cin-credits">{g.rating}</p>
        </>
      ),
    },
  ];
}

function Emojis({ label, value, options, onPick }: { label: string; value: string; options: string[]; onPick: (e: string) => void }) {
  return (
    <div className="cin-emojis" role="radiogroup" aria-label={label}>
      {options.map((e) => (
        <button key={e} type="button" role="radio" aria-checked={value === e} className={value === e ? "on" : ""} onClick={() => onPick(e)}>
          {e}
        </button>
      ))}
    </div>
  );
}

export default function TrailerMaker({ onExit }: { onExit: () => void }) {
  const [f, setF] = useState<Form>({
    hero: "a retired barista",
    heroE: "🧑‍🍳",
    problem: "the Wi-Fi went down forever",
    villain: "an army of pigeons",
    villainE: "🐦",
    title: "LAST CALL",
    genre: "action",
  });
  const [voice, setVoice] = useState(false);
  const [playing, setPlaying] = useState(false);
  const canVoice = typeof window !== "undefined" && "speechSynthesis" in window;

  if (playing)
    return (
      <Player
        scenes={build(f)}
        look={f.genre}
        voice={voice}
        onExit={() => setPlaying(false)}
        extra={
          <button type="button" className="cin-btn hide-sm" onClick={() => setPlaying(false)}>
            ✎ Edit
          </button>
        }
      />
    );

  const field = (k: "hero" | "problem" | "villain" | "title", label: string, hint: string) => (
    <label className="cin-field">
      <span>{label}</span>
      <span className="cin-field-row">
        <input value={f[k]} maxLength={60} onChange={(e) => setF((p) => ({ ...p, [k]: e.target.value }))} placeholder={hint} />
        <button type="button" className="cin-btn" aria-label={`Random ${label.toLowerCase()}`} onClick={() => setF((p) => ({ ...p, [k]: pick(POOL[k]) }))}>
          🎲
        </button>
      </span>
    </label>
  );

  return (
    <div className="cin cin-pad">
      <button type="button" className="cin-btn" onClick={onExit}>
        ← Lobby
      </button>
      <h3 className="cin-h" style={{ marginTop: 14 }}>
        Trailer Maker
      </h3>
      <p className="cin-lede">Every blockbuster is the same five sentences. Cast it, write it, roll it.</p>
      <form
        className="cin-form"
        onSubmit={(e) => {
          e.preventDefault();
          unlock("director");
          setPlaying(true);
        }}
      >
        {field("problem", "In a world where…", "the coffee ran out")}
        {field("hero", "One hero…", "a nervous accountant")}
        <Emojis label="Cast the hero" value={f.heroE} options={HEROES} onPick={(e) => setF((p) => ({ ...p, heroE: e }))} />
        {field("villain", "…must face", "a rogue roomba")}
        <Emojis label="Cast the villain" value={f.villainE} options={VILLAINS} onPick={(e) => setF((p) => ({ ...p, villainE: e }))} />
        {field("title", "Title", "COFFEE WARS")}
        <fieldset className="cin-genres">
          <legend>Genre</legend>
          {(Object.keys(GENRES) as Look[]).map((g) => (
            <label key={g} className={`g-${g}${f.genre === g ? " on" : ""}`}>
              <input type="radio" name="genre" value={g} checked={f.genre === g} onChange={() => setF((p) => ({ ...p, genre: g }))} />
              {GENRES[g].label}
            </label>
          ))}
        </fieldset>
        <div className="cin-form-actions">
          <button
            type="button"
            className="cin-btn"
            onClick={() =>
              setF({
                hero: pick(POOL.hero),
                heroE: pick(HEROES),
                problem: pick(POOL.problem),
                villain: pick(POOL.villain),
                villainE: pick(VILLAINS),
                title: pick(POOL.title),
                genre: pick(Object.keys(GENRES) as Look[]),
              })
            }
          >
            🎲 Roll everything
          </button>
          {canVoice && (
            <label className="cin-check">
              <input type="checkbox" checked={voice} onChange={(e) => setVoice(e.target.checked)} /> 🎙 Movie voice
            </label>
          )}
          <button type="submit" className="cin-btn cin-go">
            ▶ Roll trailer
          </button>
        </div>
      </form>
    </div>
  );
}
