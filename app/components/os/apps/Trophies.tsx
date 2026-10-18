"use client";

import { useEffect, useState } from "react";
import { ACHIEVEMENTS, onUnlock, unlocked, type AchievementId } from "../achievements";

export default function Trophies() {
  const [have, setHave] = useState<AchievementId[]>(unlocked);
  useEffect(() => onUnlock(() => setHave(unlocked())), []);
  const all = Object.entries(ACHIEVEMENTS) as [AchievementId, (typeof ACHIEVEMENTS)[AchievementId]][];
  return (
    <div className="os-pad">
      <p className="os-dim">
        {have.length} of {all.length} unlocked
      </p>
      <ul className="os-trophies">
        {all.map(([id, a]) => {
          const got = have.includes(id);
          return (
            <li key={id} className={got ? "got" : ""}>
              <span aria-hidden>{got ? "★" : "☆"}</span>
              <b>{got ? a.title : "???"}</b>
              <span>{got ? a.desc : "Keep exploring."}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
