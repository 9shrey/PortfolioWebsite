"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ModeSwitch from "../mode/ModeSwitch";
import { site } from "@/app/data/site";

const NAV = [
  { href: "/#work", label: "Work", match: (p: string) => p.startsWith("/work") },
  { href: "/writing", label: "Writing", match: (p: string) => p.startsWith("/writing") },
  { href: "/cv", label: "CV", match: (p: string) => p.startsWith("/cv") },
];

/** Every page but the home page (which has its own masthead). */
export default function TopBar() {
  const path = usePathname();
  if (path === "/") return null;
  return (
    <header className="ed-bar">
      <Link href="/" className="ed-bar-name">
        {site.name}
      </Link>
      <nav aria-label="Primary">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} aria-current={n.match(path) ? "page" : undefined}>
            {n.label}
          </Link>
        ))}
        <ModeSwitch to="fun" className="ed-switch">
          Fun <span aria-hidden>⏻</span>
        </ModeSwitch>
      </nav>
    </header>
  );
}
