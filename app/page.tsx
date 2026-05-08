"use client";

import { useCallback, useState } from "react";
import GlassNav from "./components/GlassNav";
import Hero from "./components/Hero";
import RecruiterModeSection from "./components/RecruiterModeSection";
import SelectedWork from "./components/SelectedWork";
import ProjectIndex from "./components/ProjectIndex";
import Experience from "./components/Experience";
import TechnicalShelf from "./components/TechnicalShelf";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import ScrollProgress from "./components/ScrollProgress";
import ProjectDrawer from "./components/ProjectDrawer";
import type { Project } from "./data/projects";

export default function Home() {
  const [drawerProject, setDrawerProject] = useState<Project | null>(null);

  const openProject = useCallback((project: Project) => {
    setDrawerProject(project);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerProject(null);
  }, []);

  return (
    <>
      <ScrollProgress />
      <GlassNav />
      <main>
        <Hero />
        <RecruiterModeSection />
        <SelectedWork onOpenProject={openProject} />
        <ProjectIndex onOpenProject={openProject} />
        <Experience />
        <TechnicalShelf />
        <ContactSection />
      </main>
      <Footer />
      <ProjectDrawer project={drawerProject} onClose={closeDrawer} />
    </>
  );
}
