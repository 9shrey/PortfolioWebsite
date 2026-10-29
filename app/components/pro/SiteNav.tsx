"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/app/room/ThemeToggle";

/** The bar on case studies, posts and the CV: the room's three titles, in the old monitor's face. */
const LINKS = [
  { href: "/#work", label: "Work", on: (p: string) => p.startsWith("/work") },
  { href: "/writing", label: "Writing", on: (p: string) => p.startsWith("/writing") },
  { href: "/#about", label: "About", on: () => false },
];

export default function SiteNav() {
  const path = usePathname() ?? "";
  return (
    <header className="nav px-nav">
      <div className="nav-in">
        <Link href="/" className="px-name" aria-label="Shrey Singh, back to the room">
          Shrey Singh
        </Link>
        <nav aria-label="Primary" className="px-links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={l.on(path) ? "page" : undefined}>{l.label}</Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
