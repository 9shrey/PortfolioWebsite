import type { Metadata } from "next";
import ExperienceView from "../components/experience/ExperienceView";

export const metadata: Metadata = {
  title: "Experience",
  description: "Shrey Singh's work history — Agneyas Labs and NetApp.",
};

export default function ExperiencePage() {
  return <ExperienceView />;
}
