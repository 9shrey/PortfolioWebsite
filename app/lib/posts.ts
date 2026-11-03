import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { marked } from "marked";

/* Posts are plain Markdown files in writing/<slug>.md. The file name is the URL.
   A block of `key: value` lines between two `---` lines starts the file:

     ---
     title: Why batched decode got slower
     date: 2026-10-20
     summary: One sentence for the list and for link previews.
     topics: gpu, inference   (optional, comma separated)
     draft: true        (optional: shows in `npm run dev` only)
     ---
*/

export interface Post {
  slug: string;
  title: string;
  date: string;
  summary: string;
  topics: string[];
  draft: boolean;
  readingTime: string;
}

const DIR = join(process.cwd(), "writing");

export const showDrafts = process.env.NODE_ENV !== "production" || process.env.SHOW_DRAFTS === "1";

function parse(raw: string, slug: string) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const fields: Record<string, string> = {};
  for (const line of (m?.[1] ?? "").split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) fields[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  const body = m ? raw.slice(m[0].length) : raw;
  const words = body.split(/\s+/).filter(Boolean).length;
  const post: Post = {
    slug,
    title: fields.title ?? slug,
    date: fields.date ?? "",
    summary: fields.summary ?? "",
    topics: (fields.topics ?? "").split(",").map((t) => t.trim()).filter(Boolean),
    draft: fields.draft === "true",
    readingTime: `${Math.max(1, Math.round(words / 230))} min read`,
  };
  return { post, body };
}

async function slugs() {
  try {
    return (await readdir(DIR)).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3));
  } catch {
    return [];
  }
}

/** Every post that should be visible in this build, newest first. */
export async function listPosts(): Promise<Post[]> {
  const posts = await Promise.all(
    (await slugs()).map(async (s) => parse(await readFile(join(DIR, `${s}.md`), "utf8"), s).post)
  );
  return posts.filter((p) => !p.draft || showDrafts).sort((a, b) => b.date.localeCompare(a.date));
}

/** One post with its body rendered to HTML, or null if it doesn't exist. */
export async function loadPost(slug: string) {
  if (!(await slugs()).includes(slug)) return null;
  const { post, body } = parse(await readFile(join(DIR, `${slug}.md`), "utf8"), slug);
  if (post.draft && !showDrafts) return null;
  // Give every ## heading an id so the contents list can link to it.
  const sections: { id: string; title: string }[] = [];
  const html = (await marked.parse(body)).replace(/<h2>(.*?)<\/h2>/g, (_, inner: string) => {
    const title = inner
      .replace(/<[^>]+>/g, "")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    sections.push({ id, title });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { post, html, sections };
}
