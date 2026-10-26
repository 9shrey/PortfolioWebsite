import type { Metadata } from "next";
import { Note } from "../components/pro/Pen";
import { nowItems, updated } from "../data/now";

export const metadata: Metadata = {
  title: "Now",
  description: "What Shrey Singh is building, learning and reading this month.",
  alternates: { canonical: "/now" },
};

export default function NowPage() {
  return (
    <div className="page">
      <p className="folio" aria-hidden>
        <span>Now</span>
        <span>Updated {updated}</span>
        <span>Shrey Singh · ML Systems</span>
      </p>
      <header className="page-head">
        <h1 className="big">Now</h1>
        <Note className="page-note" tilt={-4}>
          overwritten when it changes
        </Note>
        <p className="page-lede">What&apos;s on the bench this month.</p>
      </header>
      <ul className="now">
        {nowItems.map((n, i) => (
          <li key={n.label} data-reveal style={{ "--d": `${i * 70}ms` } as React.CSSProperties}>
            <p className="now-k">{n.label}</p>
            <p className="now-v">{n.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
