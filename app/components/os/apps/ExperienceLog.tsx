"use client";

import { education, roles } from "@/app/data/experience";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/** Experience as a log file: one timestamped line per bullet, newest first. */
export default function ExperienceLog() {
  return (
    <div className="os-log" role="log" aria-label="Experience">
      <p className="os-path">/var/log/experience.log</p>
      {roles.map((r) => (
        <div key={r.company} className="os-log-block">
          <p className="os-log-head">
            <span className="ts">[{r.from} → {r.to}]</span> <b>{slug(r.company)}</b> role=&quot;{r.title}&quot; loc={r.location}
          </p>
          {r.points.map((pt) => (
            <p key={pt} className="os-log-line">
              <span className="ts">[{r.from}]</span> <span className="lvl">INFO</span> {pt}
            </p>
          ))}
          <p className="os-log-line">
            <span className="ts">[{r.from}]</span> <span className="lvl dbg">STACK</span> {r.stack.join(", ")}
          </p>
        </div>
      ))}
      <div className="os-log-block">
        <p className="os-log-head">
          <span className="ts">[{education.from} → {education.to}]</span> <b>{slug(education.school)}</b>
        </p>
        <p className="os-log-line">
          <span className="ts">[{education.to}]</span> <span className="lvl">INFO</span> {education.degree} · {education.grade}
        </p>
      </div>
      <p className="os-log-line os-dim">-- end of log --</p>
    </div>
  );
}
