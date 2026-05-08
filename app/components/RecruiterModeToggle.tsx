"use client";

export default function RecruiterModeToggle({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`fixed bottom-6 left-6 z-50 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium shadow-[var(--shadow-md)] border transition-colors ${
        active
          ? "bg-[var(--fg)] text-white border-[var(--fg)]"
          : "bg-white text-[var(--fg-dim)] border-[var(--rule-soft)] hover:border-[var(--fg-mute)]"
      }`}
      aria-label="Toggle recruiter mode"
      title="Recruiter Mode: Condensed resume-like view"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden
      >
        <rect
          x="1.5"
          y="2.5"
          width="11"
          height="9"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <path
          d="M4 6h6M4 8h4"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
      {active ? "Recruiter On" : "Recruiter"}
    </button>
  );
}
