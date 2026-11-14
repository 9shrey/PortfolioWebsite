import { OG_SIZE, renderOg } from "./components/art/og";
import { site } from "./data/site";
import { projects } from "./data/projects";

export const alt = `${site.name}, ${site.title}: ML products built end to end`;
export const size = OG_SIZE;
export const contentType = "image/png";

// Counted from projects.ts, so the card can't drift from the case studies.
const tested = projects.filter((p) => p.testCount > 0);
const tests = tested.reduce((n, p) => n + p.testCount, 0);
const allPublic = tested.every((p) => p.codeStatus === "public");

export default function Image() {
  return renderOg({
    kicker: `${site.title} · ${site.location}`,
    title: site.tagline,
    metrics: [
      { value: "$150M+", label: "planning at NetApp" },
      { value: "6–8h → 2h", label: "pipeline runtime" },
      { value: String(tests), label: `tests across ${tested.length} ${allPublic ? "public " : ""}repos` },
    ],
    slug: "argus-fraud-detection",
  });
}
