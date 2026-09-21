import type { Metadata } from "next";
import WorkIndex from "../components/work/WorkIndex";

export const metadata: Metadata = {
  title: "Work",
  description: "Real-time ML, quant RL, LLM evaluation, and GPU kernel systems built by Shrey Singh.",
};

export default function WorkPage() {
  return <WorkIndex />;
}
