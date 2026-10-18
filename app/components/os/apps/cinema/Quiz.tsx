"use client";

import { useState } from "react";
import { unlock } from "../../achievements";
import { sound } from "../arcade/sound";

/* Guess the film from emoji. Four choices, a streak, a best streak. */

const FILMS: [string, string][] = [
  ["🦁👑", "The Lion King"],
  ["🚢🧊💔", "Titanic"],
  ["🦖🏝️🧬", "Jurassic Park"],
  ["👽🚲🌕", "E.T."],
  ["💍🌋🧙", "The Lord of the Rings"],
  ["🦇🃏🌃", "The Dark Knight"],
  ["🤖🌱❤️", "WALL-E"],
  ["🐠🔍🌊", "Finding Nemo"],
  ["🤠🚀🧸", "Toy Story"],
  ["⏰🚗⚡", "Back to the Future"],
  ["💊🕶️🐇", "The Matrix"],
  ["🦈🏖️🎵", "Jaws"],
  ["👻🚫📞", "Ghostbusters"],
  ["❄️👸⛄", "Frozen"],
  ["🌀💤🏙️", "Inception"],
  ["🚀🌽⏳", "Interstellar"],
  ["🐀👨‍🍳🍲", "Ratatouille"],
  ["🎈🏠👴", "Up"],
  ["🦍🏙️✈️", "King Kong"],
  ["👨‍🚀🥔🔴", "The Martian"],
  ["🕷️🧑🏙️", "Spider-Man"],
  ["🧞🪔🐒", "Aladdin"],
  ["🐼🥋🥟", "Kung Fu Panda"],
  ["🧟🧟🏃", "28 Days Later"],
  ["🏴‍☠️🦜💀", "Pirates of the Caribbean"],
  ["🧒👻🏠", "The Sixth Sense"],
  ["🏃🍫🪶", "Forrest Gump"],
  ["🍫🏭🎩", "Charlie and the Chocolate Factory"],
];

const KEY = "os-quiz-best";
const shuffle = <T,>(xs: T[]) => xs.map((x) => [Math.random(), x] as const).sort((a, b) => a[0] - b[0]).map(([, x]) => x);

function round(prev?: string) {
  let q: [string, string];
  do q = FILMS[Math.floor(Math.random() * FILMS.length)];
  while (q[1] === prev);
  const others = shuffle(FILMS.filter((f) => f[1] !== q[1])).slice(0, 3).map((f) => f[1]);
  return { emoji: q[0], answer: q[1], options: shuffle([q[1], ...others]) };
}

function readBest() {
  try {
    return Number(localStorage.getItem(KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
}

export default function Quiz({ onExit }: { onExit: () => void }) {
  const [q, setQ] = useState(() => round());
  const [picked, setPicked] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(readBest);

  const choose = (o: string) => {
    if (picked) return;
    setPicked(o);
    if (o === q.answer) {
      const s = streak + 1;
      setStreak(s);
      sound.play("eat");
      if (s >= 5) unlock("quiz");
      if (s > best) {
        setBest(s);
        try {
          localStorage.setItem(KEY, String(s));
        } catch {}
      }
    } else {
      setStreak(0);
      sound.play("hit");
    }
  };

  return (
    <div className="cin cin-pad">
      <button type="button" className="cin-btn" onClick={onExit}>
        ← Lobby
      </button>
      <h3 className="cin-h" style={{ marginTop: 14 }}>
        Emoji Movie Quiz
      </h3>
      <div className="cin-quiz">
        <p className="cin-quiz-stats">
          streak <b>{streak}</b> · best <b>{best}</b>
        </p>
        <p className="cin-quiz-emoji" key={q.emoji} role="img" aria-label="Emoji clue">
          {q.emoji}
        </p>
        <div className="cin-quiz-opts">
          {q.options.map((o) => (
            <button
              key={o}
              type="button"
              className={picked ? (o === q.answer ? "right" : o === picked ? "wrong" : "") : ""}
              disabled={!!picked}
              onClick={() => choose(o)}
            >
              {o}
            </button>
          ))}
        </div>
        <p className="cin-quiz-msg" aria-live="polite">
          {picked ? (picked === q.answer ? "Correct! 🍿" : `Nope: it was ${q.answer}.`) : "Which film is this?"}
        </p>
        {picked && (
          <button
            type="button"
            className="cin-btn cin-go"
            autoFocus
            onClick={() => {
              setQ(round(q.answer));
              setPicked(null);
            }}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
