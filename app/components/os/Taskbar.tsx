"use client";

import { useEffect, useRef, useState } from "react";
import Clock from "../motion/Clock";
import ModeSwitch from "../mode/ModeSwitch";
import { APPS, openApp, titleFor } from "./apps";
import { wm, useWindows } from "./wm";
import { ACHIEVEMENTS, onUnlock, unlocked } from "./achievements";

export default function Taskbar() {
  const wins = useWindows();
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLButtonElement>(null);
  const top = wm.topmost();
  const [got, setGot] = useState(() => unlocked().length);
  useEffect(() => onUnlock(() => setGot(unlocked().length)), []);

  useEffect(() => {
    if (!menu) return;
    menuRef.current?.querySelector("button")?.focus();
    const away = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !startRef.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [menu]);

  return (
    <div className="os-bar" role="toolbar" aria-label="Taskbar">
      <button
        ref={startRef}
        type="button"
        className="os-start"
        aria-expanded={menu}
        aria-controls="os-menu"
        onClick={() => setMenu((m) => !m)}
      >
        <span aria-hidden>❖</span> Start
      </button>
      {menu && (
        <div
          id="os-menu"
          ref={menuRef}
          className="os-menu"
          role="menu"
          aria-label="Apps"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              setMenu(false);
              startRef.current?.focus();
            }
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              const items = [...(menuRef.current?.querySelectorAll<HTMLButtonElement>("[role=menuitem]") ?? [])];
              const i = items.indexOf(document.activeElement as HTMLButtonElement);
              items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
            }
          }}
        >
          <p className="os-menu-head">SHREY-OS</p>
          {Object.entries(APPS)
            .filter(([, a]) => a.listed)
            .map(([id, a]) => (
              <button
                key={id}
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenu(false);
                  openApp(id);
                }}
              >
                <span className="os-menu-glyph" aria-hidden>
                  {a.glyph}
                </span>
                {a.title}
              </button>
            ))}
          <ModeSwitch to="pro" className="os-menu-exit">
            ⏻ Exit to Professional
          </ModeSwitch>
        </div>
      )}

      <div className="os-tasks">
        {wins.map((w) => {
          const t = titleFor(w.app, w.arg);
          const current = top?.id === w.id;
          return (
            <button
              key={w.id}
              type="button"
              className={`os-task${current ? " is-active" : ""}${w.min ? " is-min" : ""}`}
              aria-pressed={current}
              title={t}
              onClick={() => {
                if (current) wm.minimize(w.id);
                else {
                  wm.focus(w.id);
                  requestAnimationFrame(() => document.getElementById(`win-${w.id}`)?.focus());
                }
              }}
            >
              <span aria-hidden>{APPS[w.app]?.glyph}</span> <span className="os-task-t">{t}</span>
            </button>
          );
        })}
      </div>

      <button type="button" className="os-tray" onClick={() => openApp("trophies")} title="Achievements">
        ★ {got}/{Object.keys(ACHIEVEMENTS).length}
      </button>
      <span className="os-clock">
        BLR <Clock />
      </span>
      <ModeSwitch to="pro" className="os-pro">
        <span aria-hidden>⏻</span> <span className="hide-sm">Exit to </span>Pro
      </ModeSwitch>
    </div>
  );
}
