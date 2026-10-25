"use client";

import dynamic from "next/dynamic";
import { useMode } from "../mode/mode";
import type { Post } from "@/app/lib/posts";

// SHREY-OS is never in the professional page's bundle; it loads on first use.
const Desktop = dynamic(() => import("./Desktop"), { ssr: false });

export default function FunRoot({ posts }: { posts: Post[] }) {
  return useMode() === "fun" ? <Desktop posts={posts} /> : null;
}
