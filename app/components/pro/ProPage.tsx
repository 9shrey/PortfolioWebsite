import Link from "next/link";
import ModeSwitch from "../mode/ModeSwitch";
import CopyEmail from "../site/CopyEmail";
import { site } from "@/app/data/site";
import { education, roles } from "@/app/data/experience";
import { projects } from "@/app/data/projects";
import { skillGroups } from "@/app/data/skills";
import { listPosts, showDrafts } from "@/app/lib/posts";

/* The professional mode: one column of black on white, everything a
   recruiter needs in reading order, all of it from the data files. No
   canvas, no motion. This is also what the server always renders, so
   crawlers and no-JS visitors get the full résumé. */

const host = (u: string) => u.replace(/^https?:\/\//, "");
const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { month: "short", year: "numeric" });

export function split(title: string) {
  const i = title.indexOf(": ");
  return i < 0 ? [title, ""] : [title.slice(0, i), title.slice(i + 2)];
}

export default async function ProPage() {
  const posts = (await listPosts()).filter((p) => p.status !== "template");
  const published = posts.filter((p) => p.status === "published");
  const shown = published.length ? published : posts;

  return (
    <div className="ed">
      <header className="ed-mast">
        <div className="ed-mast-top">
          <p className="ed-eyebrow">{site.title} · {site.location}</p>
          <ModeSwitch to="fun" className="ed-switch">
            Fun mode <span aria-hidden>⏻</span>
          </ModeSwitch>
        </div>
        <h1 className="ed-name">{site.name}</h1>
        <p className="ed-links">
          <a href={`mailto:${site.email}`}>Email</a>
          <a href={site.links.linkedin} target="_blank" rel="noopener">LinkedIn</a>
          <a href={site.links.github} target="_blank" rel="noopener">GitHub</a>
          <a href={site.resume} target="_blank" rel="noopener">Resume PDF</a>
        </p>
      </header>

      <section id="about" className="ed-sec" aria-label="Summary">
        <p className="ed-lede">{site.tagline}</p>
        <p className="ed-pitch">{site.pitch}</p>
      </section>

      <section id="experience" className="ed-sec" aria-labelledby="xp-h">
        <h2 id="xp-h" className="ed-h">Experience</h2>
        {roles.map((r) => (
          <article key={r.company} className="ed-item">
            <header className="ed-item-head">
              <h3>
                {r.title}, <span>{r.company}</span>
              </h3>
              <p className="ed-meta">
                {r.from} – {r.to} · {r.location}
              </p>
            </header>
            <ul className="ed-list">
              {r.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
          </article>
        ))}
        <article className="ed-item">
          <header className="ed-item-head">
            <h3>
              {education.degree}, <span>{education.school}</span>
            </h3>
            <p className="ed-meta">
              {education.from} – {education.to} · {education.grade}
            </p>
          </header>
        </article>
      </section>

      <section id="work" className="ed-sec" aria-labelledby="work-h">
        <h2 id="work-h" className="ed-h">Selected work</h2>
        {projects.map((p) => {
          const [name, sub] = split(p.title);
          return (
            <article key={p.slug} className="ed-item ed-proj">
              <header className="ed-item-head">
                <h3>
                  <Link href={`/work/${p.slug}`}>{name}</Link>
                </h3>
                <p className="ed-meta">
                  {p.area} · {p.year}
                  {p.testCount > 0 && ` · ${p.testCount} tests`}
                </p>
              </header>
              <p className="ed-sub">{sub || p.blurb}</p>
              <dl className="ed-tldr">
                <dt>Problem</dt>
                <dd>{p.tldr.problem}</dd>
                <dt>Approach</dt>
                <dd>{p.tldr.approach}</dd>
                <dt>Result</dt>
                <dd>{p.tldr.result}</dd>
              </dl>
              <p className="ed-figs">
                {p.headline.map((m) => (
                  <span key={m.label}>
                    <b>{m.value}</b> {m.label}
                  </span>
                ))}
              </p>
              <p className="ed-actions">
                <Link href={`/work/${p.slug}`}>Case study →</Link>
                {p.github && (
                  <a href={p.github} target="_blank" rel="noopener">
                    {host(p.github)} ↗
                  </a>
                )}
              </p>
            </article>
          );
        })}
      </section>

      <section id="skills" className="ed-sec" aria-labelledby="skills-h">
        <h2 id="skills-h" className="ed-h">Skills</h2>
        <dl className="ed-skills">
          {skillGroups.map((g) => (
            <div key={g.label}>
              <dt>{g.label}</dt>
              <dd>{g.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </section>

      {shown.length > 0 && (
        <section id="writing" className="ed-sec" aria-labelledby="writing-h">
          <h2 id="writing-h" className="ed-h">Writing</h2>
          <ul className="ed-posts">
            {shown.map((p) => {
              const open = p.status === "published" || showDrafts;
              return (
                <li key={p.slug}>
                  {open ? <Link href={`/writing/${p.slug}`}>{p.title}</Link> : <span>{p.title}</span>}
                  <span className="ed-meta">{p.status === "published" ? fmt(p.date) : "In progress"}</span>
                </li>
              );
            })}
          </ul>
          <p className="ed-actions">
            <Link href="/writing">All writing →</Link>
          </p>
        </section>
      )}

      <section id="contact" className="ed-sec ed-contact" aria-labelledby="contact-h">
        <h2 id="contact-h" className="ed-h">Contact</h2>
        <p className="ed-pitch">
          The fastest way to reach me is email: <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
        <p className="ed-actions">
          <CopyEmail email={site.email} />
          <a href={site.links.linkedin} target="_blank" rel="noopener">
            {host(site.links.linkedin)} ↗
          </a>
          <a href={site.links.github} target="_blank" rel="noopener">
            {host(site.links.github)} ↗
          </a>
        </p>
      </section>
    </div>
  );
}
