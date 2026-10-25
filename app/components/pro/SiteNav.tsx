"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import ModeSwitch from "../mode/ModeSwitch";
import { site } from "@/app/data/site";

/** Home sections, in page order. On inner pages they link back to /#id. */
const SECTIONS = [
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "toolkit", label: "Toolkit" },
  { id: "writing", label: "Writing" },
  { id: "contact", label: "Contact" },
];

const noop = () => () => {};

/** One bar for every page. On the home page it tracks which section is in
 *  view and draws a reading-progress hairline (CSS scroll timeline). */
export default function SiteNav() {
  const path = usePathname();
  const home = path === "/";
  const [active, setActive] = useState<string | null>(null);
  const mac = useSyncExternalStore(
    noop,
    () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent),
    () => true
  );
  const current = home ? active : null;

  useEffect(() => {
    if (!home) return;
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const seen = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.isIntersecting);
        const first = SECTIONS.find((s) => seen.get(s.id));
        setActive(first ? first.id : null);
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [home]);

  return (
    <header className="nav" data-home={home || undefined}>
      <div className="nav-in">
        <Link href="/" className="nav-name" aria-label={`${site.name}, home`}>
          <span className="nav-mono" aria-hidden>
            SS
          </span>
          <span>{site.name}</span>
        </Link>
        <nav aria-label="Primary" className="nav-links">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={home ? `#${s.id}` : `/#${s.id}`}
              aria-current={current === s.id ? "true" : undefined}
            >
              {s.label}
            </a>
          ))}
        </nav>
        <div className="nav-act">
          <button
            type="button"
            className="nav-k"
            onClick={() => window.dispatchEvent(new Event("palette:open"))}
            aria-label="Open command menu"
          >
            <kbd>{mac ? "⌘" : "Ctrl"}</kbd>
            <kbd>K</kbd>
          </button>
          <ModeSwitch to="fun" className="nav-fun">
            <span className="nav-fun-dot" aria-hidden />
            Fun mode
          </ModeSwitch>
          <a href={site.resume} target="_blank" rel="noopener" className="nav-cv">
            Résumé
          </a>
        </div>
      </div>
      {home && <span className="nav-progress" aria-hidden />}
    </header>
  );
}
