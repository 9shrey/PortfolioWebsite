"use client";

import { useEffect, useState } from "react";

const links = [
  { href: "#work", label: "Work" },
  { href: "#experience", label: "Experience" },
  { href: "#stack", label: "Stack" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled ? "border-b border-[var(--rule-soft)] bg-[var(--bg)]/85 backdrop-blur-md" : ""
      }`}
    >
      <nav className="container-shell flex h-16 items-center justify-between">
        <a href="#top" className="micro !text-[var(--fg)]">
          SHREY SINGH
        </a>
        <div className="hidden items-center gap-8 sm:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="micro hover:!text-[var(--accent)]">
              {link.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
