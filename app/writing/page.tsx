import type { Metadata } from "next";
import Link from "next/link";
import { Note } from "../components/pro/Pen";
import { listPosts, showDrafts } from "../lib/posts";

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes by Shrey Singh on GPU kernels, inference performance and LLM evaluation: what broke, what I measured, what it was worth.",
  alternates: { canonical: "/writing" },
};

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default async function WritingPage() {
  const posts = await listPosts();
  const published = posts.filter((p) => p.status === "published").length;
  return (
    <div className="page">
      <p className="folio" aria-hidden>
        <span>Notes</span>
        <span>{published} published</span>
        <span>Shrey Singh · ML Systems</span>
      </p>
      <header className="page-head">
        <h1 className="big">Writing</h1>
        <Note className="page-note" tilt={-4}>
          what broke, how I found out, what the fix was worth
        </Note>
        <p className="page-lede">
          Long-form notes from the work, including the parts I still don&apos;t know. Every number links back to a repo.
        </p>
      </header>
      <ul className="wr">
        {posts.map((p) => {
          const open = p.status === "published" || showDrafts;
          const inner = (
            <>
              <span className="wr-date">
                {p.status === "published" ? fmt(p.date) : p.status === "template" ? "Template" : showDrafts ? "Draft" : "In progress"}
                <br />
                {p.readingTime}
              </span>
              <span className="wr-title">{p.title}</span>
              <span className="wr-ex">{p.excerpt}</span>
              <span className="wr-go" aria-hidden>
                →
              </span>
            </>
          );
          return (
            <li key={p.slug}>
              {open ? (
                <Link href={`/writing/${p.slug}`} className="wr-row">
                  {inner}
                </Link>
              ) : (
                <span className="wr-row" data-closed>
                  {inner}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
