"use client";

import CopyEmail from "../../site/CopyEmail";
import { site } from "@/app/data/site";

/** Ways to reach me. Nothing here sends anything on its own. */
export default function Mail() {
  return (
    <div className="os-pad os-mail">
      <p className="os-dim">To:</p>
      <p className="os-mail-to">{site.email}</p>
      <p className="os-links">
        <a href={`mailto:${site.email}`}>Compose ↗</a>
        <CopyEmail email={site.email} />
        <a href={site.links.linkedin} target="_blank" rel="noopener">
          LinkedIn ↗
        </a>
        <a href={site.links.github} target="_blank" rel="noopener">
          GitHub ↗
        </a>
      </p>
      <p className="os-dim">Based in {site.location} (IST, UTC+5:30).</p>
    </div>
  );
}
