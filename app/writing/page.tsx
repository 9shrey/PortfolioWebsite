import type { Metadata } from "next";
import Link from "next/link";
import { listPosts, showDrafts } from "../lib/posts";

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes by Shrey Singh on GPU kernels, inference performance and LLM evaluation: what broke, what I measured, what it was worth.",
  alternates: { canonical: "/writing" },
};

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default async function WritingPage() {
  const posts = await listPosts();
  return (
    <div className="wrap">
      <header className="page-head">
        <p className="kicker">
          <b>●</b> Notes · {posts.filter((p) => p.status === "published").length} published
        </p>
        <h1 className="page-title">
          Writing
        </h1>
        <p className="page-lede">
          Long-form notes from the work: what broke, how I found out, what the fix was worth, and what I still don&apos;t
          know. Every number links back to a repo.
        </p>
      </header>

      <div className="writing-grid">
        <ul className="posts">
          {posts.map((p) => {
            const open = p.status === "published" || showDrafts;
            const body = (
              <>
                <span className="post-meta mono">
                  {p.status !== "published" && (
                    <span className={`badge${p.status === "draft" && !showDrafts ? " wip" : ""}`}>
                      {p.status === "template" ? "Template" : showDrafts ? "Draft" : "In progress"}
                    </span>
                  )}
                  <span>{p.status === "published" ? fmt(p.date) : "Coming soon"}</span>
                  <span>{p.readingTime}</span>
                  {p.tags?.map((t) => <span key={t}>#{t}</span>)}
                </span>
                <span className="post-title">{p.title}</span>
                <span className="post-excerpt">{p.excerpt}</span>
              </>
            );
            return (
              <li key={p.slug}>
                {open ? (
                  <Link href={`/writing/${p.slug}`} className="post-row">
                    {body}
                  </Link>
                ) : (
                  <div className="post-row">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
