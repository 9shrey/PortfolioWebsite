import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ComponentType } from "react";

/* Posts are MDX files in content/writing/<slug>.mdx, each exporting `meta`.
   status: "published" posts are built and listed everywhere. "draft" and
   "template" posts render in `next dev` (or with SHOW_DRAFTS=1) so you can
   write them in place; in production, drafts are listed as in progress and
   the template never appears. */

export type PostStatus = "published" | "draft" | "template";

export interface PostMeta {
  title: string;
  excerpt: string;
  date: string;
  status: PostStatus;
  tags?: string[];
}

export interface Post extends PostMeta {
  slug: string;
  readingTime: string;
}

const DIR = join(process.cwd(), "content/writing");

export const showDrafts = process.env.NODE_ENV !== "production" || process.env.SHOW_DRAFTS === "1";

export async function loadPost(slug: string) {
  const mod = (await import(`@/content/writing/${slug}.mdx`)) as { default: ComponentType; meta: PostMeta };
  return mod;
}

async function readingTime(slug: string) {
  const src = await readFile(join(DIR, `${slug}.mdx`), "utf8");
  const words = src.replace(/export const meta[\s\S]*?\n};?\n/, "").split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 230))} min read`;
}

/** Every post, newest first. Templates only when drafts are visible. */
export async function listPosts(): Promise<Post[]> {
  let files: string[] = [];
  try {
    files = (await readdir(DIR)).filter((f) => f.endsWith(".mdx"));
  } catch {
    return [];
  }
  const posts = await Promise.all(
    files.map(async (f) => {
      const slug = f.replace(/\.mdx$/, "");
      const { meta } = await loadPost(slug);
      return { ...meta, slug, readingTime: await readingTime(slug) };
    })
  );
  return posts
    .filter((p) => p.status !== "template" || showDrafts)
    .sort((a, b) => (a.status === "template" ? 1 : 0) - (b.status === "template" ? 1 : 0) || b.date.localeCompare(a.date));
}

/** Posts that get their own page in this build. */
export async function routablePosts() {
  return (await listPosts()).filter((p) => p.status === "published" || showDrafts);
}
