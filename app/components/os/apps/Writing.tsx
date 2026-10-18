"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOs } from "../context";
import { goPro } from "../nav";

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** Posts as a text editor: a file list and the open file's header. Drafts
 *  are locked; published posts open in the professional reader. */
export default function Writing() {
  const { posts } = useOs();
  const router = useRouter();
  const [sel, setSel] = useState(posts[0]?.slug);
  const post = posts.find((p) => p.slug === sel);

  if (!posts.length) return <p className="os-pad">~/writing is empty.</p>;
  return (
    <div className="os-editor">
      <ul className="os-editor-files" aria-label="Posts">
        {posts.map((p) => (
          <li key={p.slug}>
            <button type="button" aria-current={p.slug === sel || undefined} onClick={() => setSel(p.slug)}>
              {p.status === "published" ? "▤" : "🔒"} {p.slug}.mdx
            </button>
          </li>
        ))}
      </ul>
      {post && (
        <div className="os-editor-doc">
          <p className="os-dim">
            {post.status === "published" ? fmt(post.date) : "draft · locked"} · {post.readingTime}
            {post.tags?.map((t) => ` · #${t}`)}
          </p>
          <h3>{post.title}</h3>
          <p>{post.excerpt}</p>
          {post.status === "published" ? (
            <p className="os-links">
              <button type="button" onClick={() => goPro((h) => router.push(h), `/writing/${post.slug}`)}>
                Read it →
              </button>
            </p>
          ) : (
            <p className="os-locked">🔒 locked: still being written.</p>
          )}
        </div>
      )}
    </div>
  );
}
