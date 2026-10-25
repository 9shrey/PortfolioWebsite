"use client";

import { openApp } from "./index";
import { mode } from "../../mode/mode";

/** Opens once, on the first boot: what's on this machine and how to drive it. */
export default function Readme() {
  const items: [string, string, string][] = [
    ["projects", "Projects", "five case files, each with its own particle figure"],
    ["terminal", "Terminal", "try neofetch, top, nvidia-smi, sudo hire-me"],
    ["arcade", "Arcade", "three games: Token Snake, Roofline Runner, Cache Breakout"],
    ["cinema", "Cinema", "make a movie trailer, write a space crawl, emoji quiz"],
    ["about", "About.exe", "the pixel portrait and ~/skills"],
  ];
  return (
    <div className="os-pad os-readme">
      <pre className="os-readme-h" aria-hidden>{`# README.txt`}</pre>
      <p>Welcome to SHREY-OS: the playful half of this portfolio. Everything here is real: every number comes from a project repo.</p>
      <ul>
        {items.map(([id, name, what]) => (
          <li key={id}>
            <button type="button" className="os-file" onClick={() => openApp(id)}>
              ▸ {name}
            </button>{" "}
            <span className="os-dim">— {what}</span>
          </li>
        ))}
      </ul>
      <p className="os-dim">
        Drag windows by their title bar · Esc closes · there are achievements to find (★ in the taskbar).
      </p>
      <p className="os-links">
        <button type="button" onClick={() => mode.request("pro")}>
          ⏻ Just want the résumé? Professional mode
        </button>
      </p>
    </div>
  );
}
