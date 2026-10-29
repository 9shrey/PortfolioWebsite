import type { Metadata } from "next";
import Link from "next/link";
import { listPosts, showDrafts } from "@/app/lib/posts";

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes by Shrey Singh on GPU kernels, inference performance and LLM evaluation: what broke, what I measured, what it was worth.",
  alternates: { canonical: "/writing" },
};

const fmt = (d: string) => new Date(d).toISOString().slice(0, 10);

export default async function WritingPage() {
  const posts = await listPosts();
  return (
    <div className="wx-col">
      <p className="wx-back"><Link href="/">◂ The desk</Link></p>
      <h1 className="wx-h">Writing</h1>
      <p className="wx-lede">
        Long-form notes from the work: what broke, how I found out, and what the fix was worth. Every number links back to a repo.
      </p>
      <ol className="wx-list">
        {posts.map((p) => {
          const open = p.status === "published" || showDrafts;
          const when = p.status === "published" ? fmt(p.date) : p.status === "template" ? "template" : showDrafts ? "draft" : "soon";
          const inner = (
            <>
              <span className="wx-date">{when}</span>
              <span className="wx-title">{p.title}</span>
              <span className="wx-ex">{p.excerpt} <span className="wx-rt">{p.readingTime}</span></span>
            </>
          );
          return (
            <li key={p.slug}>
              {open ? <Link href={`/writing/${p.slug}`} className="wx-row">{inner}</Link> : <span className="wx-row" data-closed>{inner}</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
