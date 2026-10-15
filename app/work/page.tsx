import type { Metadata } from "next";
import { WorkList } from "../components/sections/Bodies";

export const metadata: Metadata = {
  title: "Work",
  description: "Real-time ML, quant RL, LLM evaluation, and GPU kernel systems built by Shrey Singh.",
};

export default function WorkPage() {
  return <WorkList />;
}
