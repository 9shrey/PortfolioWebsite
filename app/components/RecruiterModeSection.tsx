"use client";

import { BriefcaseBusiness, Code2, Database, Network } from "lucide-react";
import GlassCard from "./GlassCard";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

const rows = [
  {
    icon: BriefcaseBusiness,
    title: "Target roles",
    text: "AI/ML Engineer, GenAI Engineer, MLOps Engineer, Backend Engineer",
  },
  {
    icon: Database,
    title: "NetApp impact",
    text: "$150M+ quarterly planning, 1.5M+ records, 4,900+ sales reps, 15% accuracy lift, 6-10% MAPE",
  },
  {
    icon: Network,
    title: "Systems angle",
    text: "RAG, LangGraph agents, forecasting pipelines, CI/CD retraining, quant ML",
  },
  {
    icon: Code2,
    title: "Stack",
    text: "Python, SQL, Go, TypeScript, FastAPI, LangGraph, XGBoost, Redis, Docker, CI/CD",
  },
];

export default function RecruiterModeSection() {
  return (
    <section id="recruiter-mode" className="py-16 md:py-24">
      <div className="container-shell">
        <SectionHeader
          eyebrow="Recruiter Mode"
          kicker="Scan fast"
          title="The resume signal stays visible in one scan."
          text="A static-readable snapshot of target roles, internship impact, systems focus, and stack depth."
        />

        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((row, index) => {
            const Icon = row.icon;
            return (
              <Reveal key={row.title} delay={index * 45}>
                <GlassCard className="h-full p-6 md:p-7">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white/54 text-[var(--accent)]">
                        <Icon size={22} strokeWidth={1.8} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-[var(--fg)]">{row.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-[var(--fg-dim)] md:text-base">
                          {row.text}
                        </p>
                      </div>
                    </div>
                </GlassCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
