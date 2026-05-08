"use client";

import { useState, useCallback } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import SelectedWork from "./components/SelectedWork";
import ProjectIndex from "./components/ProjectIndex";
import Experience from "./components/Experience";
import TechnicalShelf from "./components/TechnicalShelf";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import ScrollProgress from "./components/ScrollProgress";
import Reveal from "./components/Reveal";
import ProjectDrawer from "./components/ProjectDrawer";
import CommandPalette from "./components/CommandPalette";
import RecruiterModeToggle from "./components/RecruiterModeToggle";
import ProofModeToggle from "./components/ProofModeToggle";
import { getSelectedProjects, type Project } from "./data/projects";

export default function Home() {
  const [recruiterMode, setRecruiterMode] = useState(false);
  const [proofMode, setProofMode] = useState(false);
  const [drawerProject, setDrawerProject] = useState<Project | null>(null);

  const openProject = useCallback((p: Project) => {
    setDrawerProject(p);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerProject(null);
  }, []);

  const scrollToProject = useCallback(
    (p: Project) => {
      setDrawerProject(p);
    },
    []
  );

  return (
    <>
      <ScrollProgress />
      <Nav />
      <CommandPalette onSelect={scrollToProject} />

      <main className={recruiterMode ? "max-w-[900px] mx-auto" : ""}>
        <Hero />

        {recruiterMode ? (
          <>
            <Experience />
            <section className="py-20 md:py-32">
              <div className="mx-auto max-w-[1200px] px-6 md:px-8">
                <Reveal>
                  <div className="border-t border-[var(--rule-soft)] pt-8 md:pt-12 mb-4">
                    <div className="flex items-baseline gap-4 mb-8">
                      <span className="micro">SELECTED</span>
                      <span className="flex-1 h-px bg-[var(--rule-soft)]" />
                      <span className="micro">WORK</span>
                    </div>
                    <h2 className="display text-4xl sm:text-6xl md:text-7xl max-w-4xl">
                      Selected{" "}
                      <span className="display-italic">projects.</span>
                    </h2>
                  </div>
                </Reveal>
                <div className="mt-12 space-y-6">
                    {getSelectedProjects().map((p: Project, i: number) => (
                      <Reveal key={p.slug} delay={i * 40}>
                        <div className="rounded-[var(--radius-md)] border border-[var(--rule-soft)] bg-white p-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">
                                {p.title}
                              </h3>
                              <p className="text-sm text-[var(--accent)] mt-1">
                                {p.category}
                              </p>
                              <p className="text-sm text-[var(--fg-dim)] mt-2 leading-relaxed">
                                {p.resumeBullet}
                              </p>
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {p.stack.map((t: string) => (
                                  <span
                                    key={t}
                                    className="text-[10px] tracking-wide px-2 py-0.5 rounded-full bg-[var(--bg-2)] text-[var(--fg-dim)]"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Reveal>
                    ))}
                </div>
              </div>
            </section>
            <TechnicalShelf />
            <ContactSection />
          </>
        ) : (
          <>
            <SelectedWork
              proofMode={proofMode}
              onOpenProject={openProject}
            />
            <ProjectIndex
              proofMode={proofMode}
              onOpenProject={openProject}
            />
            <Experience />
            <TechnicalShelf />
            <ContactSection />
          </>
        )}
      </main>

      <Footer />

      <ProjectDrawer project={drawerProject} onClose={closeDrawer} />

      <RecruiterModeToggle
        active={recruiterMode}
        onToggle={() => setRecruiterMode((v) => !v)}
      />
      <ProofModeToggle
        active={proofMode}
        onToggle={() => setProofMode((v) => !v)}
      />

      {/* Keyboard shortcut hint */}
      <div className="fixed bottom-6 right-6 z-50 hidden md:flex items-center gap-2">
        <kbd className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white border border-[var(--rule-soft)] text-[10px] text-[var(--fg-mute)] shadow-[var(--shadow-sm)]">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path
              d="M3 5l2 2 4-4"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          K
        </kbd>
        <span className="micro micro-dim">Search</span>
      </div>
    </>
  );
}
