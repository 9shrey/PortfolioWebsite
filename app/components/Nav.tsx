"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "hero", label: "Home" },
  { id: "work", label: "Work" },
  { id: "projects", label: "All Projects" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled
          ? "glass-strong border-b border-[color:var(--rule-soft)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1200px] px-6 md:px-8 h-14 flex items-center justify-between">
        <a href="#hero" className="flex items-center gap-2.5 group">
          <span className="font-semibold text-sm tracking-tight text-[var(--fg)]">
            Shrey Singh
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-[13px] tracking-wide text-[var(--fg-dim)] hover:text-[var(--fg)] transition-colors link-hover"
            >
              {s.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="/Shrey_Singh_Resume.pdf"
            target="_blank"
            rel="noreferrer"
            className="text-[13px] font-medium text-[var(--accent)] hover:underline"
          >
            Resume
          </a>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="md:hidden text-[13px] tracking-wide px-4 py-2 rounded-full border border-[var(--rule-soft)]"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[var(--rule-soft)] bg-[var(--bg)]">
          <div className="px-6 py-5 flex flex-col gap-4">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setOpen(false)}
                className="text-sm text-[var(--fg)] py-1"
              >
                {s.label}
              </a>
            ))}
            <a
              href="/Shrey_Singh_Resume.pdf"
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-[var(--accent)] pt-2 border-t border-[var(--rule-soft)]"
            >
              Download Resume
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
