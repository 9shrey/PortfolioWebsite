"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

export default function GlassNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <div
        className={`liquid-nav mx-auto max-w-[1120px] rounded-full px-3 py-2 transition-all duration-300 md:px-4 ${
          scrolled ? "is-scrolled" : ""
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <a
            href="#hero"
            className="relative z-10 rounded-full px-3 py-2 text-sm font-semibold text-[var(--fg)] transition-colors hover:bg-white/24"
            onClick={() => setOpen(false)}
          >
            Shrey Singh
          </a>

          <nav className="relative z-10 hidden items-center gap-1 rounded-full border border-white/25 bg-white/12 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] md:flex">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-full px-4 py-2 text-sm font-medium text-[var(--fg-dim)] transition-colors hover:bg-white/26 hover:text-[var(--fg)]"
              >
                {section.label}
              </a>
            ))}
          </nav>

          <div className="relative z-10 hidden md:block">
            <a href="/Shrey_Singh_Resume.pdf" target="_blank" rel="noreferrer" className="liquid-button min-h-10 px-4 text-sm">
              Resume
            </a>
          </div>

          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/45 bg-white/18 text-[var(--fg)] shadow-sm backdrop-blur-xl md:hidden"
          >
            <span className="sr-only">Menu</span>
            <span className="relative h-3.5 w-4" aria-hidden>
              <span
                className={`absolute left-0 h-0.5 w-4 rounded-full bg-current transition-transform ${
                  open ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 h-0.5 w-4 rounded-full bg-current transition-opacity ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 h-0.5 w-4 rounded-full bg-current transition-transform ${
                  open ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <div className="liquid-nav mx-auto mt-2 max-w-[1120px] rounded-[var(--radius-lg)] p-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--fg)] hover:bg-white/24"
              >
                {section.label}
              </a>
            ))}
            <a
              href="/Shrey_Singh_Resume.pdf"
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="liquid-button mt-2 w-full"
            >
              Resume
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
