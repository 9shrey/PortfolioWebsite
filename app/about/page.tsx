import type { Metadata } from "next";
import { AboutBody } from "../components/sections/Bodies";

export const metadata: Metadata = {
  title: "About",
  description: "Shrey Singh's background and technical stack.",
};

export default function AboutPage() {
  return <AboutBody />;
}
