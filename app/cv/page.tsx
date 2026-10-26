import type { Metadata } from "next";
import { projects } from "../data/projects";
import { education, roles } from "../data/experience";
import { skillGroups } from "../data/skills";
import { site } from "../data/site";

export const metadata: Metadata = {
  title: "CV",
  description: `${site.name}: ${site.title}. Experience, projects, education and skills on one printable page.`,
  alternates: { canonical: "/cv" },
};

const host = (u: string) => u.replace(/^https?:\/\//, "");

/** The fast path: everything a recruiter needs, one page, no canvas, prints
 *  cleanly. Generated from the same data files as the rest of the site. */
export default function CvPage() {
  return (
    <div className="page cv">
      <header className="cv-head">
        <h1 className="cv-name">{site.name}</h1>
        <p className="cv-contact">
          <span>{site.title}</span>
          <span>{site.location}</span>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <a href={site.links.github}>{host(site.links.github)}</a>
          <a href={site.links.linkedin}>{host(site.links.linkedin)}</a>
        </p>
        <p className="cv-pitch">
          {site.tagline} {site.pitch}
        </p>
        <p className="acts cv-actions">
          <a className="act act-ink" href={site.resume} target="_blank" rel="noopener">
            Résumé PDF <span aria-hidden>↗</span>
          </a>
        </p>
      </header>

      <h2 className="cv-k">Experience</h2>
      {roles.map((r) => (
        <div key={r.company} className="cv-item">
          <p className="cv-item-head">
            <b>
              {r.title}, {r.company}
            </b>
            <span>
              {r.from} – {r.to} · {r.location}
            </span>
          </p>
          <ul>
            {r.points.map((pt) => (
              <li key={pt}>{pt}</li>
            ))}
          </ul>
        </div>
      ))}

      <h2 className="cv-k">Projects</h2>
      {projects.map((p) => (
        <div key={p.slug} className="cv-item">
          <p className="cv-item-head">
            <b>{p.title}</b>
            <span>{p.github ? host(p.github) : p.year}</span>
          </p>
          <ul>
            <li>{p.resumeBullet}</li>
          </ul>
        </div>
      ))}

      <h2 className="cv-k">Education</h2>
      <div className="cv-item">
        <p className="cv-item-head">
          <b>
            {education.degree}, {education.school}
          </b>
          <span>
            {education.from} – {education.to} · {education.grade}
          </span>
        </p>
      </div>

      <h2 className="cv-k">Skills</h2>
      <div className="cv-skills">
        {skillGroups.map((g) => (
          <p key={g.label}>
            <b>{g.label}:</b> {g.items.join(", ")}
          </p>
        ))}
      </div>
    </div>
  );
}
