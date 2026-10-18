"use client";

import type { AppProps } from "./index";
import FieldAnchor from "../../field/FieldAnchor";
import { useFigurePriority } from "../wm";
import { education, roles } from "@/app/data/experience";
import { site } from "@/app/data/site";
import { skillGroups } from "@/app/data/skills";

const dir = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** The particle portrait, the bio, and ~/skills as a directory listing. */
export default function About({ winId }: AppProps) {
  const z = useFigurePriority(winId);
  return (
    <div className="os-about">
      <figure className="os-about-fig">
        <FieldAnchor figure="portrait" priority={z} label={`Pixel portrait of ${site.name}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/field/portrait.png" alt="" width={256} height={256} />
        </FieldAnchor>
      </figure>
      <div className="os-about-txt">
        <h3>{site.name}</h3>
        <p className="os-dim">
          {site.title} · {site.location}
        </p>
        <p>{site.tagline}</p>
        <p>{site.pitch}</p>
        <p className="os-dim">
          now: {roles[0].title} @ {roles[0].company} · {education.degree}, {education.school} ({education.grade})
        </p>
        <pre className="os-ls" aria-label="Skills">
          <span className="os-prompt">shrey@os:~$</span> ls -l ~/skills{"\n"}
          {skillGroups.map(
            (g) =>
              `drwxr-xr-x  ${String(g.items.length).padStart(2)}  ${dir(g.label)}/\n` + g.items.map((i) => `    -rw-r--r--  ${i}\n`).join("")
          )}
        </pre>
      </div>
    </div>
  );
}
