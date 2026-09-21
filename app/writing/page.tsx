import type { Metadata } from "next";
import WritingIndexView from "../components/writing/WritingIndexView";

export const metadata: Metadata = {
  title: "Writing",
  description: "Technical notes from Shrey Singh's projects — evaluation design, GPU debugging, and benchmark methodology.",
};

export default function WritingPage() {
  return <WritingIndexView />;
}
