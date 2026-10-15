"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PartLink from "./PartLink";
import { PARTS, resolveScene } from "@/app/data/package";

/** Wordmark left, the six districts right (each with its die code), one
 *  shared cyan bar that slides to the active district. On phones the
 *  districts become a sticky pill row — still one tap to anything. */
export default function TopBar() {
  const scene = resolveScene(usePathname());
  const navRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const activeKey = scene.id === "project" ? "work" : scene.id;

  useLayoutEffect(() => {
    const nav = navRef.current;
    const bar = barRef.current;
    if (!nav || !bar) return;
    const place = () => {
      const a = nav.querySelector<HTMLElement>(`[data-part="${activeKey}"]`);
      if (!a) {
        bar.style.opacity = "0";
        return;
      }
      bar.style.opacity = "1";
      bar.style.transform = `translateX(${a.offsetLeft}px) scaleX(${a.offsetWidth / 100})`;
    };
    place();
    // Fonts swap in after first paint and change every link's width.
    document.fonts?.ready.then(place);
    const ro = new ResizeObserver(place);
    ro.observe(nav);
    return () => ro.disconnect();
  }, [activeKey]);

  return (
    <header className="topbar" data-ui="">
      <Link href="/" scroll={false} className="wordmark" aria-label="Shrey Singh — home">
        <span className="wordmark-name">SHREY SINGH</span>
        <span className="wordmark-sub">AI/ML ENGINEER · BENGALURU</span>
      </Link>

      <nav ref={navRef} className="districts" aria-label="Sections">
        {PARTS.map((p) => (
          <PartLink
            key={p.key}
            part={p.key}
            href={p.route}
            className="district"
            aria-current={activeKey === p.key ? "page" : undefined}
          >
            <span className="district-code">{p.code}</span>
            <span className="district-label">{p.label}</span>
          </PartLink>
        ))}
        <span ref={barRef} className="district-bar" aria-hidden />
      </nav>

      <a className="resume-pill" href="/Shrey_Singh_Resume.pdf" target="_blank" rel="noopener" data-ui="">
        Resume
      </a>
    </header>
  );
}
