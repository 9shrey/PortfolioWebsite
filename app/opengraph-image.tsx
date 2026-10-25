import { OG_SIZE, renderOg } from "./components/art/og";
import { site } from "./data/site";

export const alt = `${site.name}, ${site.title}: the measured roofline behind a 5.2× LLM decode speedup`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOg({
    kicker: `${site.title} · ${site.location}`,
    title: site.tagline,
    metrics: [
      { value: "5.2×", label: "LLM decode, same GPU" },
      { value: "503", label: "tests, 4 public repos" },
      { value: "$150M+", label: "planning at NetApp" },
    ],
    slug: "inferbench",
  });
}
