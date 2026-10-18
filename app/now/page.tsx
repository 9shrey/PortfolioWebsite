import type { Metadata } from "next";
import { nowItems, updated } from "../data/now";

export const metadata: Metadata = {
  title: "Now",
  description: "What Shrey Singh is building, learning and reading this month.",
  alternates: { canonical: "/now" },
};

export default function NowPage() {
  return (
    <div className="wrap">
      <header className="page-head">
        <p className="kicker">Updated {updated}</p>
        <h1 className="page-title">
          Now
        </h1>
        <p className="page-lede">What&apos;s on the bench this month. Overwritten when it changes.</p>
      </header>
      <ul className="now-list" style={{ marginBottom: 64 }}>
        {nowItems.map((n) => (
          <li key={n.label}>
            <p className="kicker">{n.label}</p>
            <p className="prose">{n.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
