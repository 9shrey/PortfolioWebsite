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
        className={`mx-auto max-w-[1120px] rounded-full border px-3 py-2 transition-all duration-300 md:px-4 ${
          scrolled
            ? "border-white/75 bg-white/68 shadow-[0_18px_55px_rgba(25,34,48,0.16)] backdrop-blur-2xl"
            : "border-white/55 bg-white/42 shadow-[0_12px_38px_rgba(25,34,48,0.1)] backdrop-blur-xl"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <a
            href="#hero"
            className="rounded-full px-3 py-2 text-sm font-semibold text-[var(--fg)] transition-colors hover:bg-white/55"
            onClick={() => setOpen(false)}
          >
            Shrey Singh
          </a>

          <nav className="hidden items-center gap-1 rounded-full bg-white/34 p-1 md:flex">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-full px-4 py-2 text-sm font-medium text-[var(--fg-dim)] transition-colors hover:bg-white/70 hover:text-[var(--fg)]"
              >
                {section.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:block">
            <a href="/Shrey_Singh_Resume.pdf" target="_blank" rel="noreferrer" className="liquid-button min-h-10 px-4 text-sm">
              Resume
            </a>
          </div>

          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/58 text-[var(--fg)] shadow-sm md:hidden"
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
        <div className="mx-auto mt-2 max-w-[1120px] rounded-[var(--radius-lg)] border border-white/70 bg-white/78 p-3 shadow-[var(--shadow-md)] backdrop-blur-2xl md:hidden">
          <nav className="flex flex-col gap-1">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--fg)] hover:bg-white/70"
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
