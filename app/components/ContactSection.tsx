"use client";

import Reveal from "./Reveal";

const links = [
  {
    label: "Email",
    href: "mailto:9shrey@gmail.com",
    value: "9shrey@gmail.com",
    external: false,
  },
  {
    label: "GitHub",
    href: "https://github.com/9shrey",
    value: "/9shrey",
    external: true,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/9shrey",
    value: "/in/9shrey",
    external: true,
  },
  {
    label: "Portfolio",
    href: "https://9shrey.vercel.app",
    value: "9shrey.vercel.app",
    external: true,
  },
];

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 md:py-32 bg-[var(--bg)]">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <Reveal>
          <div className="border-t border-[var(--rule-soft)] pt-8 md:pt-12 mb-4">
            <div className="flex items-baseline gap-4 mb-8">
              <span className="micro">CONTACT</span>
              <span className="flex-1 h-px bg-[var(--rule-soft)]" />
              <span className="micro">CONNECT</span>
            </div>
            <h2 className="display text-4xl sm:text-6xl md:text-7xl max-w-3xl">
              Have a role, project, or hard system worth{" "}
              <span className="display-italic">building?</span>
            </h2>
            <p className="mt-6 max-w-xl text-[var(--fg-dim)] text-base md:text-lg leading-relaxed">
              Open to full-time AI/ML, GenAI, MLOps, backend, and applied ML
              roles starting 2026. Let&apos;s talk.
            </p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-12 grid sm:grid-cols-2 gap-3 max-w-2xl">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.external ? "_blank" : undefined}
                rel={l.external ? "noreferrer" : undefined}
                className="group flex items-center justify-between px-5 py-4 rounded-[var(--radius-sm)] border border-[var(--rule-soft)] hover:border-[var(--fg-dim)] hover:bg-[var(--bg-2)] transition-colors"
              >
                <span className="micro">{l.label}</span>
                <span className="text-sm text-[var(--fg)]">
                  {l.value} {l.external ? "↗" : ""}
                </span>
              </a>
            ))}
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-6">
            <a
              href="/Shrey_Singh_Resume.pdf"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium border border-[var(--rule)] hover:bg-[var(--bg-2)] transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden
              >
                <path
                  d="M8 2v8M4 8l4 4 4-4M2 14h12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Download Resume PDF
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
