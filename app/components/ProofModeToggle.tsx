"use client";

export default function ProofModeToggle({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`fixed bottom-6 left-36 z-50 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium shadow-[var(--shadow-md)] border transition-colors ${
        active
          ? "bg-[var(--accent)] text-white border-[var(--accent)]"
          : "bg-white text-[var(--fg-dim)] border-[var(--rule-soft)] hover:border-[var(--fg-mute)]"
      }`}
      aria-label="Toggle proof mode"
      title="Proof Mode: Show verification badges on project cards"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden
      >
        <path
          d="M2 7.5l3 3 7-7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {active ? "Proof On" : "Proof"}
    </button>
  );
}
