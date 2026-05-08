import type { Project } from "@/app/data/projects";

const visualTheme: Record<
  string,
  {
    label: string;
    bars: string[];
    nodes: string[];
    accent: string;
  }
> = {
  "rag-knowledge-assistant": {
    label: "Hybrid retrieval demo",
    bars: ["88%", "64%", "76%"],
    nodes: ["PDF", "Embed", "pgvector", "Cite"],
    accent: "#0b63ce",
  },
  "agentic-workflow-assistant": {
    label: "LangGraph workflow",
    bars: ["42%", "74%", "58%"],
    nodes: ["Inbox", "Plan", "Approve", "Schedule"],
    accent: "#7c3aed",
  },
  "automl-pipeline-framework": {
    label: "AutoML run board",
    bars: ["68%", "92%", "51%"],
    nodes: ["Clean", "Search", "Prune", "Explain"],
    accent: "#0891b2",
  },
  "cicd-retraining-pipeline": {
    label: "Retraining pipeline",
    bars: ["36%", "84%", "70%"],
    nodes: ["Drift", "Train", "Gate", "Canary"],
    accent: "#059669",
  },
  "rl-statistical-arbitrage": {
    label: "Pairs trading lab",
    bars: ["54%", "28%", "82%"],
    nodes: ["Pairs", "Spread", "Policy", "PnL"],
    accent: "#475569",
  },
  "ai-waiter": {
    label: "Ordering agent",
    bars: ["78%", "46%", "62%"],
    nodes: ["Chat", "Tools", "Cart", "WhatsApp"],
    accent: "#ea580c",
  },
  lifeos: {
    label: "Life system surface",
    bars: ["72%", "55%", "88%"],
    nodes: ["Goals", "Plan", "Agent", "Review"],
    accent: "#2563eb",
  },
};

function MiniLine({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 220 80" className="h-20 w-full" aria-hidden>
      <defs>
        <linearGradient id={`line-${accent.replace("#", "")}`} x1="0" y1="0" x2="1" y2="0">
          <stop stopColor={accent} stopOpacity="0.15" />
          <stop offset="0.55" stopColor={accent} stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.92" />
        </linearGradient>
      </defs>
      <path
        d="M5 58 C35 22, 55 62, 82 38 S135 18, 160 44 S198 66, 215 24"
        fill="none"
        stroke={`url(#line-${accent.replace("#", "")})`}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M5 58 C35 22, 55 62, 82 38 S135 18, 160 44 S198 66, 215 24"
        fill="none"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ProjectVisual({
  project,
  compact = false,
}: {
  project: Project;
  compact?: boolean;
}) {
  const theme =
    visualTheme[project.slug] ??
    ({
      label: "System demo",
      bars: ["60%", "72%", "44%"],
      nodes: project.stack.slice(0, 4),
      accent: "#0b63ce",
    } as const);

  return (
    <div className={`liquid-demo ${compact ? "mb-5 h-44 p-4" : "mb-6 h-56 p-5"}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fg-dim)]">
            {theme.label}
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--fg)]">{project.outcome}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/56">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.accent }} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-[0.9fr_1.1fr] gap-4">
        <div className="space-y-2">
          {theme.bars.map((bar, index) => (
            <div key={bar} className="rounded-full border border-white/60 bg-white/34 p-1">
              <div
                className="h-2.5 rounded-full"
                style={{
                  width: bar,
                  background: `linear-gradient(90deg, ${theme.accent}, rgba(255,255,255,0.8))`,
                  opacity: 0.9 - index * 0.12,
                }}
              />
            </div>
          ))}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {theme.nodes.slice(0, 4).map((node) => (
              <div
                key={node}
                className="truncate rounded-xl border border-white/60 bg-white/38 px-2.5 py-2 text-[11px] font-semibold text-[var(--fg-dim)]"
              >
                {node}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/60 bg-white/26 p-3">
          <MiniLine accent={theme.accent} />
        </div>
      </div>
    </div>
  );
}
