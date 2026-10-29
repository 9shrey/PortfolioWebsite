"use client";

import { useState } from "react";
import type { RoomContent } from "./types";

export type Tab = "about" | "writing" | "online";

/** What's on the laptop: a small reading app with three tabs. Writing opens a post right here on the
 *  screen (the post page in a frame, without the site's chrome). It is placed on the lid by the
 *  engine (CSS 3D), so it's real, selectable, accessible HTML. */
export default function LaptopScreen({ c, tab, onTab }: { c: RoomContent; tab: Tab; onTab(t: Tab): void }) {
  const [reading, setReading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const open = (slug: string) => setReading(slug);

  return (
    <div className="lap">
      <header className="lap-bar">
        <span className="lap-dots" aria-hidden><i /><i /><i /></span>
        <nav className="lap-tabs" aria-label="Laptop">
          {(["about", "writing", "online"] as const).map((t) => (
            <button key={t} aria-current={tab === t && !reading ? "page" : undefined}
              onClick={() => { setReading(null); onTab(t); }}>
              {t === "about" ? "About" : t === "writing" ? "Writing" : "Online"}
            </button>
          ))}
        </nav>
        <span className="lap-clock" aria-hidden>{c.name.split(" ")[0].toLowerCase()}@desk</span>
      </header>

      {reading ? (
        <div className="lap-reader">
          <div className="lap-reader-bar">
            <button onClick={() => setReading(null)}>All writing</button>
            <a href={`/writing/${reading}`}>Open as a page</a>
          </div>
          <iframe title="Post" src={`/writing/${reading}?embed=1`} />
        </div>
      ) : tab === "about" ? (
        <article className="lap-page lap-about">
          <h1>{c.name}</h1>
          <p className="lap-lead">{c.about.lead}</p>
          <div className="lap-cols">
            <div>{c.about.paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div>
            <aside>
              <h2>Education</h2>
              <p>{c.about.education}</p>
              <h2>Tools</h2>
              {c.about.skills.map((s) => <p key={s.group}><b>{s.group}.</b> {s.items.join(", ")}</p>)}
            </aside>
          </div>
        </article>
      ) : tab === "writing" ? (
        <article className="lap-page lap-writing">
          <h1>Writing</h1>
          <p className="lap-lead">Notes from the projects: what I measured, and what fooled me first.</p>
          <ol className="lap-posts">
            {c.posts.map((p) => (
              <li key={p.slug}>
                <button onClick={() => open(p.slug)}>
                  <span className="pd">{new Date(p.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                  <span className="pt">{p.title}</span>
                  <span className="pe">{p.excerpt}</span>
                  <span className="pr">{p.readingTime}{p.status === "draft" ? " · draft" : ""}</span>
                </button>
              </li>
            ))}
          </ol>
        </article>
      ) : (
        <article className="lap-page lap-online">
          <h1>Online</h1>
          <p className="lap-lead">Email is fastest. I answer everything that isn&apos;t a sales pitch.</p>
          <p className="lap-email">
            <a href={`mailto:${c.email}`}>{c.email}</a>
            <button onClick={() => { navigator.clipboard?.writeText(c.email); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
              {copied ? "Copied" : "Copy"}
            </button>
          </p>
          <ul className="lap-links">
            {c.links.map((l) => <li key={l.label}><a href={l.href} target="_blank" rel="noopener">{l.label}<span>{l.handle}</span></a></li>)}
            <li><a href={c.resume} target="_blank" rel="noopener">Résumé<span>PDF</span></a></li>
          </ul>
        </article>
      )}
    </div>
  );
}
