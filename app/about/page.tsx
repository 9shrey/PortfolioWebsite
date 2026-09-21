import type { Metadata } from "next";
import AboutView from "../components/about/AboutView";

export const metadata: Metadata = {
  title: "About",
  description: "Shrey Singh's background and technical stack.",
};

export default function AboutPage() {
  return <AboutView />;
}
