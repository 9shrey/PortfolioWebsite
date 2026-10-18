"use client";

import { useState } from "react";

/* Crawl Creator: write your own space-opera opening and roll it. */

const PRESETS = [
  {
    intro: "A long time ago, in a codebase far, far away…",
    ep: "EPISODE VII",
    title: "THE PHANTOM BUG",
    text: "It is a period of unrest in the repository. Rebel tests, striking from a hidden CI pipeline, have won their first victory against the dreaded Flaky Build.\n\nDuring the battle, a lone developer discovered the bug only appears on Fridays, after lunch, when nobody is watching.\n\nPursued by sinister merge conflicts, the developer races home aboard a 3 a.m. hotfix, custodian of the stack trace that can restore peace to production…",
  },
  {
    intro: "A long time ago, in a kitchen far, far away…",
    ep: "EPISODE II",
    title: "ATTACK OF THE LEFTOVERS",
    text: "The fridge is in turmoil. A container of three-week-old rice has declared independence from the top shelf.\n\nWhile the condiments debate in the door, a brave jar of pickles assembles a resistance behind the milk.\n\nBut the true threat lurks in the vegetable drawer, where something that was once lettuce has begun to whisper…",
  },
  {
    intro: "A long time ago, on a sofa far, far away…",
    ep: "EPISODE V",
    title: "THE REMOTE STRIKES BACK",
    text: "The living room is divided. The remote control has vanished, and with it, all hope of changing the channel.\n\nScouts have searched beneath every cushion. They found coins, crumbs and a single sock, but no remote.\n\nNow, as the same cooking show plays for the fourth hour, one hero must decide whether to get up and press the buttons on the TV itself…",
  },
];

function Roll({ intro, ep, title, text }: (typeof PRESETS)[number]) {
  const [take, setTake] = useState(0);
  return (
    <div className="cin-crawl-wrap">
      <div className="cin-stars" aria-hidden />
      <div className="os-crawl" key={take}>
        <p className="os-crawl-intro">{intro}</p>
        <div className="os-crawl-stage" aria-hidden>
          <div className="os-crawl-text">
            <p className="os-crawl-ep">{ep}</p>
            <p className="os-crawl-title">{title}</p>
            {text
              .split(/\n\s*\n/)
              .filter(Boolean)
              .map((para, i) => (
                <p key={i}>{para}</p>
              ))}
          </div>
        </div>
        <p className="sr-only">
          {ep}: {title}. {text}
        </p>
      </div>
      <button type="button" className="cin-btn cin-replay" onClick={() => setTake((t) => t + 1)}>
        ↺ Replay
      </button>
    </div>
  );
}

export default function Crawl({ onExit }: { onExit: () => void }) {
  const [c, setC] = useState(PRESETS[0]);
  const [rolling, setRolling] = useState(false);

  if (rolling)
    return (
      <div className="cin-player">
        <Roll {...c} />
        <div className="cin-controls">
          <button type="button" className="cin-btn" onClick={() => setRolling(false)}>
            ✎ Edit
          </button>
          <button type="button" className="cin-btn" onClick={onExit}>
            ← Lobby
          </button>
        </div>
      </div>
    );

  return (
    <div className="cin cin-pad">
      <button type="button" className="cin-btn" onClick={onExit}>
        ← Lobby
      </button>
      <h3 className="cin-h" style={{ marginTop: 14 }}>
        Crawl Creator
      </h3>
      <p className="cin-lede">Write the opening crawl for your own space opera. Blank lines make new paragraphs.</p>
      <div className="cin-presets" role="group" aria-label="Presets">
        {PRESETS.map((p) => (
          <button key={p.title} type="button" className={`cin-btn${c.title === p.title ? " on" : ""}`} onClick={() => setC(p)}>
            {p.title}
          </button>
        ))}
      </div>
      <form
        className="cin-form"
        onSubmit={(e) => {
          e.preventDefault();
          setRolling(true);
        }}
      >
        <label className="cin-field">
          <span>Intro</span>
          <input value={c.intro} maxLength={80} onChange={(e) => setC({ ...c, intro: e.target.value })} />
        </label>
        <div className="cin-form-2">
          <label className="cin-field">
            <span>Episode</span>
            <input value={c.ep} maxLength={20} onChange={(e) => setC({ ...c, ep: e.target.value.toUpperCase() })} />
          </label>
          <label className="cin-field">
            <span>Title</span>
            <input value={c.title} maxLength={40} onChange={(e) => setC({ ...c, title: e.target.value.toUpperCase() })} />
          </label>
        </div>
        <label className="cin-field">
          <span>Crawl</span>
          <textarea value={c.text} rows={7} maxLength={900} onChange={(e) => setC({ ...c, text: e.target.value })} />
        </label>
        <div className="cin-form-actions">
          <button type="submit" className="cin-btn cin-go">
            ▶ Roll the crawl
          </button>
        </div>
      </form>
    </div>
  );
}
