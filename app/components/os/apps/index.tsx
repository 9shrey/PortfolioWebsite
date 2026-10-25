import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { wm, type Size } from "../wm";

/* Every app SHREY-OS can open. Each is its own chunk, loaded on first open. */

export interface AppProps {
  arg?: string;
  winId: string;
}

export interface App {
  title: string;
  /** Desktop/start-menu glyph: plain text, drawn in the icon tile. */
  glyph: string;
  size: Size;
  /** On the desktop and in the start menu (case files and notes aren't). */
  listed: boolean;
  Component: ComponentType<AppProps>;
}

const load = (f: () => Promise<{ default: ComponentType<AppProps> }>) => dynamic(f, { ssr: false, loading: () => <p className="os-loading">loading…</p> });

export const APPS: Record<string, App> = {
  terminal: { title: "Terminal", glyph: ">_", size: { w: 720, h: 460 }, listed: true, Component: load(() => import("./Terminal")) },
  projects: { title: "Projects", glyph: "[/]", size: { w: 720, h: 420 }, listed: true, Component: load(() => import("./Projects")) },
  case: { title: "Case file", glyph: "#", size: { w: 820, h: 600 }, listed: false, Component: load(() => import("./CaseFile")) },
  about: { title: "About.exe", glyph: "@", size: { w: 780, h: 560 }, listed: true, Component: load(() => import("./About")) },
  experience: { title: "experience.log", glyph: "≡", size: { w: 760, h: 480 }, listed: true, Component: load(() => import("./ExperienceLog")) },
  writing: { title: "Writing", glyph: "¶", size: { w: 720, h: 480 }, listed: true, Component: load(() => import("./Writing")) },
  arcade: { title: "Arcade", glyph: "▲", size: { w: 660, h: 640 }, listed: true, Component: load(() => import("./Arcade")) },
  cinema: { title: "Cinema", glyph: "▶", size: { w: 920, h: 660 }, listed: true, Component: load(() => import("./Cinema")) },
  mail: { title: "Mail", glyph: "✉", size: { w: 480, h: 360 }, listed: true, Component: load(() => import("./Mail")) },
  resume: { title: "Resume.pdf", glyph: "PDF", size: { w: 760, h: 640 }, listed: true, Component: load(() => import("./Resume")) },
  assistant: { title: "Assistant", glyph: "◉", size: { w: 460, h: 380 }, listed: true, Component: load(() => import("./Assistant")) },
  trash: { title: "Trash", glyph: "⌫", size: { w: 520, h: 320 }, listed: true, Component: load(() => import("./Trash")) },
  readme: { title: "README.txt", glyph: "txt", size: { w: 560, h: 440 }, listed: false, Component: load(() => import("./Readme")) },
  trophies: { title: "Achievements", glyph: "★", size: { w: 460, h: 460 }, listed: false, Component: load(() => import("./Trophies")) },
  note: { title: "Note", glyph: "txt", size: { w: 560, h: 380 }, listed: false, Component: load(() => import("./Note")) },
};

export function titleFor(app: string, arg?: string) {
  if (app === "case" && arg) return `${arg}.case`;
  if (app === "note" && arg) return arg;
  return APPS[app]?.title ?? app;
}

export function openApp(app: string, arg?: string) {
  const a = APPS[app];
  if (a) wm.open(app, a.size, arg);
}
