"use client";

import { useEffect, useState } from "react";
import TearablePanel from "./TearablePanel";

export default function TearableLanding({ onComplete }: { onComplete: () => void }) {
  const [leaving, setLeaving] = useState(false);

  const complete = () => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(onComplete, 620);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") complete();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div
      className={`tear-gate fixed inset-0 z-[120] flex items-center justify-center px-5 transition-opacity duration-500 ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome. Tear to see Shrey's website."
    >
      <TearablePanel
        className="tear-gate-sheet w-full max-w-4xl rounded-[46px]"
        threshold={86}
        intensity={1.15}
        onReveal={complete}
        reveal={
          <div className="flex h-full items-center justify-center p-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--fg-dim)]">
              Opening portfolio
            </p>
          </div>
        }
      >
        <div className="glass-surface rounded-[46px] px-7 py-16 text-center md:px-12 md:py-24">
          <div className="glass-content">
            <p className="micro mb-5">Portfolio surface</p>
            <h1 className="display mx-auto max-w-3xl text-balance text-5xl md:text-7xl">
              WELCOME, TEAR TO SEE SHREY&apos;S WEBSITE.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-sm font-medium leading-7 text-[var(--fg-dim)] md:text-base">
              Drag this soft glass sheet sideways or pull with touch. The portfolio behind it stays clean and readable.
            </p>
            <button
              type="button"
              onClick={complete}
              className="button-secondary mt-8"
              aria-label="Enter Shrey's website"
            >
              Enter
            </button>
          </div>
        </div>
      </TearablePanel>
    </div>
  );
}
