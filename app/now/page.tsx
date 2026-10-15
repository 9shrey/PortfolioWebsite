import type { Metadata } from "next";
import { NowBody } from "../components/sections/Bodies";

export const metadata: Metadata = {
  title: "Now",
  description: "What Shrey Singh is currently building, learning, and reading.",
};

export default function NowPage() {
  return <NowBody />;
}
