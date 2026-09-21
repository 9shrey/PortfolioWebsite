import type { Metadata } from "next";
import NowView from "../components/now/NowView";

export const metadata: Metadata = {
  title: "Now",
  description: "What Shrey Singh is currently building, learning, and reading.",
};

export default function NowPage() {
  return <NowView />;
}
