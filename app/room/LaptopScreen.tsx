"use client";

import { useState } from "react";
import type { RoomContent } from "./types";

export type Tab = "about" | "writing" | "online";

/** What's on the laptop: a night-mode reading app. A sidebar with the three sections (and the posts
 *  under Writing), and a page beside it. A post opens right here, as a sheet of paper in the app. It is
 *  placed on the lid by the engine (CSS 3D), so it's real, selectable, accessible HTML. */
export default function LaptopScreen({ c, tab, onTab }: { c: RoomContent; tab: Tab; onTab(t: Tab): void }) {
  const [reading, setReading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const post = c.posts.find((p) => p.slug === reading);
  const date = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const go = (t: Tab) => { setReading(null); onTab(t); };

  return (
    <div className="lap">
      <div className="lap-chrome">
        <span className="lap-dots" aria-hidden><i /><i /><i /></span>
        <span className="lap-title">{post ? post.title : tab === "about" ? "About" : tab === "writing" ? "Writing" : "Online"}</span>
      </div>
      <div className="lap-body">
        <nav className="lap-side" aria-label="Laptop">
          <p className="lap-me">{c.name}</p>
          <button className="lap-sec" aria-current={tab === "about" && !reading ? "page" : undefined} onClick={() => go("about")}>About</button>
          <button className="lap-sec" aria-current={tab === "writing" && !reading ? "page" : undefined} onClick={() => go("writing")}>Writing</button>
          <ul className="lap-sub">
            {c.posts.map((p) => (
              <li key={p.slug}>
                <button aria-current={reading === p.slug ? "page" : undefined} onClick={() => { onTab("writing"); setReading(p.slug); }}>{p.title}</button>
              </li>
            ))}
          </ul>
          <button className="lap-sec" aria-current={tab === "online" && !reading ? "page" : undefined} onClick={() => go("online")}>Online</button>
        </nav>

        <main className="lap-main">
          {post ? (
            <div className="lap-reader">
              <div className="lap-reader-bar">
                <button onClick={() => setReading(null)}>All writing</button>
                <span>{date(post.date)} · {post.readingTime}</span>
                <a href={`/writing/${post.slug}`}>Open as a page</a>
              </div>
              <iframe title={post.title} src={`/writing/${post.slug}?embed=1`} />
            </div>
          ) : tab === "writing" ? (
            <article className="lap-page">
              <p className="lap-kicker">{c.posts.length} posts</p>
              <h1 className="lap-h">Writing</h1>
              <p className="lap-lead">Notes from the projects: what I measured, and what fooled me first.</p>
              <ol className="lap-index">
                {c.posts.map((p) => (
                  <li key={p.slug}>
                    <button onClick={() => setReading(p.slug)}>
                      <span className="ix-meta">{date(p.date)} · {p.readingTime}{p.status === "draft" ? " · draft" : ""}</span>
                      <span className="ix-title">{p.title}</span>
                      <span className="ix-ex">{p.excerpt}</span>
                      <span className="ix-go">Read</span>
                    </button>
                  </li>
                ))}
              </ol>
            </article>
          ) : tab === "about" ? (
            <article className="lap-page">
              <p className="lap-kicker">{c.title}, {c.location}</p>
              <h1 className="lap-h">{c.name}</h1>
              <p className="lap-lead">{c.about.lead}</p>
              <div className="lap-cols">
                <div className="lap-prose">{c.about.paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div>
                <aside className="lap-facts">
                  <h2>Education</h2>
                  <p>{c.about.education}</p>
                  {c.about.skills.map((s) => (
                    <div key={s.group}><h2>{s.group}</h2><p>{s.items.join(", ")}</p></div>
                  ))}
                </aside>
              </div>
            </article>
          ) : (
            <article className="lap-page">
              <p className="lap-kicker">Online</p>
              <h1 className="lap-h">Say hi</h1>
              <p className="lap-lead">Email is fastest. I answer everything that isn&apos;t a sales pitch.</p>
              <p className="lap-email">
                <a href={`mailto:${c.email}`}>{c.email}</a>
                <button onClick={() => { navigator.clipboard?.writeText(c.email); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
                  {copied ? "Copied" : "Copy"}
                </button>
              </p>
              <ul className="lap-links">
                {c.links.map((l) => <li key={l.label}><a href={l.href} target="_blank" rel="noopener"><b>{l.label}</b><span>{l.handle}</span></a></li>)}
                <li><a href={c.resume} target="_blank" rel="noopener"><b>Résumé</b><span>PDF, one page</span></a></li>
              </ul>
            </article>
          )}
        </main>
      </div>
    </div>
  );
}
