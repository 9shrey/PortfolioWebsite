"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ModeSwitch from "../mode/ModeSwitch";
import { site } from "@/app/data/site";

/** Home sections, in page order. On inner pages they link back to /#id. */
const SECTIONS = [
  { id: "work", label: "Work" },
  { id: "notes", label: "Notes" },
  { id: "experience", label: "Experience" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
];

/** One thin bar for every page. On the home page it tracks the section in
 *  view and hides while you read downward, coming back when you scroll up. */
export default function SiteNav() {
  const path = usePathname();
  const home = path === "/";
  const [active, setActive] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
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

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 6) return;
      setHidden(y > last && y > 400);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="nav" data-hidden={hidden || undefined}>
      <div className="nav-in">
        <Link href="/" className="nav-name" aria-label={`${site.name}, home`}>
          Shrey Singh
        </Link>
        <nav aria-label="Primary" className="nav-links">
          {SECTIONS.map((s, i) => (
            <a key={s.id} href={home ? `#${s.id}` : `/#${s.id}`} aria-current={current === s.id ? "true" : undefined}>
              <sup>{String(i + 1).padStart(2, "0")}</sup>
              {s.label}
            </a>
          ))}
          <Link href="/writing" aria-current={path.startsWith("/writing") ? "page" : undefined}>
            <sup>06</sup>Writing
          </Link>
        </nav>
        <div className="nav-act">
          <button
            type="button"
            className="nav-k"
            onClick={() => window.dispatchEvent(new Event("palette:open"))}
            aria-label="Open the menu (press / or Ctrl K)"
          >
            <span className="nav-k-sm">Menu</span>
            <kbd className="nav-k-lg">/</kbd>
          </button>
          <ModeSwitch to="fun" className="nav-fun">
            Fun mode
          </ModeSwitch>
          <a href={site.resume} target="_blank" rel="noopener" className="nav-cv">
            Résumé
          </a>
        </div>
      </div>
    </header>
  );
}
