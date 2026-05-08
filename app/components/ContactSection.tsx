"use client";

import GlassCard from "./GlassCard";
import Reveal from "./Reveal";

export default function ContactSection() {
  return (
    <section id="contact" className="py-16 md:py-24">
      <div className="container-shell">
        <Reveal>
          <GlassCard className="overflow-hidden p-6 md:p-10 lg:p-12">
            <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_50%_0%,rgba(11,99,206,0.14),transparent_65%)]" aria-hidden />
            <div className="relative max-w-3xl">
              <p className="micro mb-5">Contact</p>
              <h2 className="display text-balance text-4xl sm:text-5xl md:text-7xl">
                Have a role, project, or hard system worth building?
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--fg-dim)] md:text-lg">
                Open to full-time AI/ML, GenAI, MLOps, backend, and applied ML roles starting 2026.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="mailto:9shrey@gmail.com" className="button-primary">
                  Email
                </a>
                <a href="https://linkedin.com/in/9shrey" target="_blank" rel="noreferrer" className="button-secondary">
                  LinkedIn
                </a>
                <a href="/Shrey_Singh_Resume.pdf" target="_blank" rel="noreferrer" className="button-secondary">
                  Resume
                </a>
              </div>
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}
