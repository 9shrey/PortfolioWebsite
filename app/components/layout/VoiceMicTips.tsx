"use client";

import { motion } from "framer-motion";

const EXAMPLES = ['"go to work"', '"filter by genai"', '"tell me about argus"', '"what can you do"'];

export default function VoiceMicTips({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      role="dialog"
      aria-label="Voice navigation tips"
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="absolute bottom-full left-0 mb-3 w-64 rounded-2xl border border-[var(--rule)] bg-[var(--bg-raise)]/95 p-4 shadow-2xl backdrop-blur-md"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="micro text-[var(--fg)]">Tap the orb and just talk</p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss tips"
          className="-mr-1 -mt-1 rounded-full p-1 text-[var(--fg-mute)] transition-colors hover:text-[var(--fg)]"
        >
          ×
        </button>
      </div>
      <ul className="flex flex-col gap-1.5">
        {EXAMPLES.map((ex) => (
          <li key={ex} className="micro text-[var(--fg-dim)]">
            {ex}
          </li>
        ))}
      </ul>
      <span
        aria-hidden
        className="absolute -bottom-1.5 left-6 h-3 w-3 rotate-45 border-b border-r border-[var(--rule)] bg-[var(--bg-raise)]"
      />
    </motion.div>
  );
}
