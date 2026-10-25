"use client";

import { useEffect, useRef } from "react";
import { APPS, titleFor } from "./apps";
import { wm, type Win } from "./wm";

/** One window: a labelled, non-modal dialog. Drag it by the title bar
 *  (desktop), Esc closes it and focus goes back to whatever opened it. On
 *  phones CSS turns every window into a full-screen sheet. */
export default function Window({ win, active }: { win: Win; active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const app = APPS[win.app];
  const title = titleFor(win.app, win.arg);
  const titleId = `win-${win.id}-t`;

  // New windows take focus so the keyboard follows the eye.
  useEffect(() => {
    ref.current?.focus();
  }, []);

  if (!app) return null;
  const { Component } = app;

  const drag = (e: React.PointerEvent) => {
    if (win.max || e.button !== 0 || window.innerWidth < 720) return;
    if ((e.target as Element).closest("button")) return;
    const sx = e.clientX - win.x;
    const sy = e.clientY - win.y;
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => wm.move(win.id, ev.clientX - sx, ev.clientY - sy);
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };

  return (
    <div
      ref={ref}
      id={`win-${win.id}`}
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
      className={`os-win${active ? " is-active" : ""}${win.max ? " is-max" : ""}${win.closing ? " is-closing" : ""}`}
      hidden={win.min}
      style={{ "--x": `${win.x}px`, "--y": `${win.y}px`, "--w": `${win.w}px`, "--h": `${win.h}px`, zIndex: win.z } as React.CSSProperties}
      onPointerDownCapture={() => wm.focus(win.id)}
      onFocusCapture={() => wm.focus(win.id)}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !e.defaultPrevented) {
          e.stopPropagation();
          wm.close(win.id);
        }
      }}
    >
      <div className="os-win-bar" onPointerDown={drag} onDoubleClick={() => wm.toggleMax(win.id)}>
        <span className="os-win-glyph" aria-hidden>
          {app.glyph}
        </span>
        <h2 id={titleId} className="os-win-title">
          {title}
        </h2>
        <div className="os-win-ctl">
          <button type="button" onClick={() => wm.minimize(win.id)} aria-label={`Minimize ${title}`}>
            _
          </button>
          <button type="button" className="hide-sm" onClick={() => wm.toggleMax(win.id)} aria-label={win.max ? `Restore ${title}` : `Maximize ${title}`}>
            {win.max ? "❐" : "□"}
          </button>
          <button type="button" onClick={() => wm.close(win.id)} aria-label={`Close ${title}`}>
            ×
          </button>
        </div>
      </div>
      <div className="os-win-body">
        <Component arg={win.arg} winId={win.id} />
      </div>
    </div>
  );
}
