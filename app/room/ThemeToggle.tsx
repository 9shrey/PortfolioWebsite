"use client";

import { useState } from "react";

/** Auto / Light / Dark for the reading view, like Felix's. The choice is kept in this browser;
 *  the head script applies it before first paint. */
const ORDER = ["auto", "light", "dark"] as const;
type Theme = (typeof ORDER)[number];

function stored(): Theme {
  try { const t = localStorage.getItem("plain.theme"); return ORDER.includes(t as Theme) ? (t as Theme) : "auto"; } catch { return "auto"; }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => (typeof window === "undefined" ? "auto" : stored()));
  const next = () => {
    const t = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
    setTheme(t);
    if (t === "auto") document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("plain.theme", t); } catch {}
  };
  return (
    <button className="pl-theme" onClick={next} aria-label={`Colour theme: ${theme}. Change`} suppressHydrationWarning>
      {theme === "auto" ? "Auto" : theme === "light" ? "Light" : "Dark"}
    </button>
  );
}
