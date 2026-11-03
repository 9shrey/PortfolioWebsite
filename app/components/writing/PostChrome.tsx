"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Props {
  title: string;
  sections: { id: string; title: string }[];
}

/** The sticky bar (way back, title, reading progress, part n/N) and the contents list beside a post. */
export default function PostChrome({ title, sections }: Props) {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);
  const parts = sections.length + 1;

  useEffect(() => {
    const heads = sections.map((s) => document.getElementById(s.id));
    const article = document.querySelector<HTMLElement>(".wx-prose");
    const onScroll = () => {
      if (article) {
        const r = article.getBoundingClientRect();
        const total = r.height - window.innerHeight * 0.6;
        setProgress(Math.min(1, Math.max(0, -r.top / Math.max(total, 1))));
      }
      let a = 0;
      heads.forEach((h, i) => {
        if (h && h.getBoundingClientRect().top < window.innerHeight * 0.35) a = i + 1;
      });
      setActive(a);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sections]);

  return (
    <>
      <div className="wx-bar">
        <div className="wx-bar-in">
          <Link href="/writing" className="wx-bar-back">◂ Posts</Link>
          <span className="wx-bar-title" data-on={progress > 0.01 ? "" : undefined}>{title}</span>
          {sections.length > 0 && <span className="wx-bar-part">Part {active + 1}/{parts}</span>}
        </div>
        <div className="wx-bar-prog" style={{ transform: `scaleX(${progress})` }} />
      </div>
      {sections.length > 0 && (
        <nav className="wx-toc" aria-label="Contents">
          <p>Contents</p>
          <a href="#top" aria-current={active === 0 ? "true" : undefined}>Start</a>
          {sections.map((s, i) => (
            <a key={s.id} href={`#${s.id}`} aria-current={active === i + 1 ? "true" : undefined}>{s.title}</a>
          ))}
        </nav>
      )}
    </>
  );
}
