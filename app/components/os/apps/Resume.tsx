"use client";

import { site } from "@/app/data/site";

export default function Resume() {
  return (
    <div className="os-pdf">
      <p className="os-links">
        <a href={site.resume} target="_blank" rel="noopener">
          Open in a new tab ↗
        </a>
        <a href={site.resume} download>
          Download
        </a>
      </p>
      <iframe src={`${site.resume}#view=FitH`} title={`${site.name} resume (PDF)`} />
    </div>
  );
}
