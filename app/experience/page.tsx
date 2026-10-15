import type { Metadata } from "next";
import { ExperienceBody } from "../components/sections/Bodies";

export const metadata: Metadata = {
  title: "Experience",
  description: "Shrey Singh's work history — Agneyas Labs and NetApp.",
};

export default function ExperiencePage() {
  return <ExperienceBody />;
}
