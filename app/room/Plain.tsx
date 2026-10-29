import ThemeToggle from "./ThemeToggle";
import type { RoomContent } from "./types";

/** The reading view: everything in the room, as one plain page. */
export default function Plain({ c }: { c: RoomContent }) {
  const jobs = c.cards.filter((x) => x.kind === "role");
  const projects = c.cards.filter((x) => x.kind === "project");
  return (
    <div className="plain" id="content">
      <header className="pl-head">
        {/* a still of the room, like the one Felix's static page opens with */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="pl-still" src="/room/still.webp" width={1600} height={1000}
          alt="A desk at night by a rainy window in New York: a lamp, GPU cards in a rack, a keyboard, a mug, and a 2026 planner on the wall." />
        <div className="pl-top"><h1>{c.name}</h1><ThemeToggle /></div>
        <p className="pl-lead">{c.about.lead}</p>
        <nav className="pl-nav" aria-label="Sections">
          <a href="#work">Work</a><a href="#about">About</a><a href="#writing">Writing</a><a href="#books">Books</a><a href="#year">Year</a><a href="#contact">Contact</a>
          {/* a full page load, so the head script runs again and lets the room through */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="pl-room" href="/?room=1">Open the room →</a>
        </nav>
      </header>

      <section id="work" aria-labelledby="h-work">
        <h2 id="h-work">Work</h2>
        {jobs.map((j) => (
          <article key={j.id} className="pl-item">
            <h3>{j.title}</h3>
            <p className="pl-meta">{j.years}</p>
            <p>{j.blurb}</p>
            {j.body.map((b, i) => <p key={i}>{b.v}</p>)}
          </article>
        ))}
        <h2 className="pl-sub">Projects</h2>
        {projects.map((p) => (
          <article key={p.id} className="pl-item">
            <h3>{p.links[0] ? <a href={p.links[0].href}>{p.title}</a> : p.title}</h3>
            <p className="pl-meta">{p.area} · {p.years}</p>
            <p>{p.blurb}</p>
          </article>
        ))}
      </section>

      <section id="about" aria-labelledby="h-about">
        <h2 id="h-about">About</h2>
        {c.about.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        <p className="pl-meta">{c.about.education}</p>
      </section>

      <section id="writing" aria-labelledby="h-writing">
        <h2 id="h-writing">Writing</h2>
        {[...new Set(c.posts.map((p) => p.date.slice(0, 4)))].map((y) => (
          <div key={y} className="pl-year">
            <h3 className="pl-y">{y}</h3>
            <ol className="pl-posts">
              {c.posts.filter((p) => p.date.startsWith(y)).map((p) => (
                <li key={p.slug}><a href={`/writing/${p.slug}`}>{p.title}</a> <span className="pl-meta">{p.readingTime}</span></li>
              ))}
            </ol>
          </div>
        ))}
      </section>

      <section id="books" aria-labelledby="h-books">
        <h2 id="h-books">Books</h2>
        <ul className="pl-books">{c.books.map((b, i) => <li key={i}><b>{b.title}</b>, {b.author}. {b.note}</li>)}</ul>
      </section>

      <section id="year" aria-labelledby="h-year">
        <h2 id="h-year">{c.year}: the goals</h2>
        <ul>{c.goals.map((g) => <li key={g.text}>{g.done ? "Done: " : ""}{g.text}</li>)}</ul>
      </section>

      <section id="contact" aria-labelledby="h-contact">
        <h2 id="h-contact">Contact</h2>
        <p><a href={`mailto:${c.email}`}>{c.email}</a></p>
        <p>{c.links.map((l) => <a key={l.label} className="pl-link" href={l.href}>{l.label}</a>)} <a className="pl-link" href={c.resume}>Résumé (PDF)</a></p>
      </section>
    </div>
  );
}
