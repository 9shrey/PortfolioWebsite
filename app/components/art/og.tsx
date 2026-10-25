import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import Plate, { INK } from "./Plate";
import { site } from "@/app/data/site";
import type { Metric } from "@/app/data/projects";

/** Share images: the project's plate beside its title and headline numbers,
 *  in the site's own type. One renderer for every route. */

export const OG_SIZE = { width: 1200, height: 630 };

const fonts = Promise.all([
  readFile(join(process.cwd(), "app/fonts/og/anybody-latin-800-normal.woff")),
  readFile(join(process.cwd(), "app/fonts/og/martian-mono-latin-400-normal.woff")),
  readFile(join(process.cwd(), "app/fonts/og/familjen-grotesk-latin-400-normal.woff")),
]);

export async function renderOg({
  kicker,
  title,
  metrics,
  slug,
}: {
  kicker: string;
  title: string;
  metrics: Metric[];
  slug: string;
}) {
  const [display, mono, sans] = await fonts;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: INK.bg,
          color: "#efe9df",
          padding: 60,
          gap: 44,
          alignItems: "center",
          fontFamily: "Sans",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1, height: "100%" }}>
          <div style={{ display: "flex", fontFamily: "Mono", fontSize: 18, color: "#8e877c", textTransform: "uppercase" }}>
            <div style={{ width: 12, height: 12, background: "#ff4f1a", marginRight: 12, marginTop: 4 }} />
            {kicker}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Display",
              fontSize: title.length > 40 ? 54 : 72,
              lineHeight: 0.95,
              marginTop: 26,
              textTransform: "uppercase",
              letterSpacing: -1,
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", gap: 26, marginTop: "auto" }}>
            {metrics.slice(0, 3).map((m) => (
              <div key={m.label} style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", fontFamily: "Mono", fontSize: 36, color: "#efe9df", lineHeight: 1 }}>{m.value}</div>
                <div style={{ display: "flex", fontFamily: "Mono", fontSize: 15, color: "#8e877c", marginTop: 10, maxWidth: 180 }}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", fontSize: 20, color: "#bdb6aa", marginTop: 34 }}>
            <span style={{ fontFamily: "Display", fontSize: 30, color: "#ff4f1a", marginRight: 14, textTransform: "uppercase" }}>
              {site.name}
            </span>
            {site.title} · {site.url.replace("https://", "")}
          </div>
        </div>
        <div style={{ display: "flex", border: "1px solid rgba(239,233,223,0.14)", overflow: "hidden" }}>
          <Plate slug={slug} px={460} />
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Display", data: display, style: "normal", weight: 800 },
        { name: "Mono", data: mono, style: "normal", weight: 400 },
        { name: "Sans", data: sans, style: "normal", weight: 400 },
      ],
    }
  );
}
