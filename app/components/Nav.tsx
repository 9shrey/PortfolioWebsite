"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "about", label: "I. About" },
  { id: "projects", label: "II. Work" },
  { id: "toolkit", label: "III. Toolkit" },
  { id: "contact", label: "IV. Contact" },
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
      className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 ${
        scrolled
          ? "bg-[#0a0a0a]/80 backdrop-blur border-b border-[color:var(--rule)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-3 group">
          <span className="micro">S/S</span>
          <span className="hidden sm:inline micro">Shrey Singh</span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="micro link-hover hover:text-[color:var(--fg)]"
            >
              {s.label}
            </a>
          ))}
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="md:hidden micro px-3 py-2 border border-[color:var(--rule)]"
        >
          {open ? "CLOSE" : "MENU"}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[color:var(--rule)] bg-[#0a0a0a]/95 backdrop-blur">
          <div className="px-6 py-6 flex flex-col gap-4">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setOpen(false)}
                className="micro text-[color:var(--fg)]"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
