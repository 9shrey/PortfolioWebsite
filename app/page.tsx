"use client";

import { useCallback, useState } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Work from "./components/Work";
import Experience from "./components/Experience";
import Stack from "./components/Stack";
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
      <Nav />
      <main>
        <Hero />
        <Work onOpenProject={openProject} />
        <Experience />
        <Stack />
        <ContactSection />
      </main>
      <Footer />
      <ProjectDrawer project={drawerProject} onClose={closeDrawer} />
    </>
  );
}
