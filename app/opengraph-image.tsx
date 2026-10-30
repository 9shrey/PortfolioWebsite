import { OG_SIZE, renderOg } from "./components/art/og";
import { site } from "./data/site";

export const alt = `${site.name}, ${site.title}: ML products built end to end`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOg({
    kicker: `${site.title} · ${site.location}`,
    title: site.tagline,
    metrics: [
      { value: "$150M+", label: "planning at NetApp" },
      { value: "6–8h → 2h", label: "pipeline runtime" },
      { value: "568", label: "tests, 5 public repos" },
    ],
    slug: "argus-fraud-detection",
  });
}
