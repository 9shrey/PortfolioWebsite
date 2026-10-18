"use client";

import { useEffect, useState } from "react";
import { ACHIEVEMENTS, onUnlock, type AchievementId } from "./achievements";

/** Achievement toasts, bottom right, four seconds each. */
export default function Toasts() {
  const [items, setItems] = useState<{ key: number; id: AchievementId }[]>([]);
  useEffect(
    () =>
      onUnlock((id) => {
        const key = Date.now() + Math.random();
        setItems((xs) => [...xs, { key, id }]);
        window.setTimeout(() => setItems((xs) => xs.filter((x) => x.key !== key)), 4200);
      }),
    []
  );
  return (
    <div className="os-toasts" role="status" aria-live="polite">
      {items.map(({ key, id }) => (
        <div key={key} className="os-toast">
          <span className="os-toast-k">ACHIEVEMENT UNLOCKED</span>
          <b>{ACHIEVEMENTS[id].title}</b>
          <span>{ACHIEVEMENTS[id].desc}</span>
        </div>
      ))}
    </div>
  );
}
