import type { Metadata } from "next";
import Link from "next/link";
import { listPosts } from "@/app/lib/posts";

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes by Shrey Singh on GPU kernels, inference performance and LLM evaluation: what broke, what I measured, what it was worth.",
  alternates: { canonical: "/writing" },
};

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default async function WritingPage() {
  const posts = await listPosts();
  return (
    <div className="wx-col">
      <p className="wx-back"><Link href="/">◂ Home</Link></p>
      <h1 className="wx-h">Writing</h1>
      <ul className="wx-list">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/writing/${p.slug}`}>{p.title}</Link>
            <time dateTime={p.date}>{fmt(p.date)}</time>
          </li>
        ))}
      </ul>
    </div>
  );
}
