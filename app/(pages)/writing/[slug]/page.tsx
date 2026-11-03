import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listPosts, loadPost } from "@/app/lib/posts";
import { site } from "@/app/data/site";
import PostChrome from "@/app/components/writing/PostChrome";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await listPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const found = await loadPost(slug);
  if (!found) return {};
  const { post } = found;
  const url = `/writing/${post.slug}`;
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: url },
    robots: post.draft ? { index: false, follow: false } : undefined,
    openGraph: { title: post.title, description: post.summary, url, type: "article", publishedTime: post.date, siteName: site.name },
    twitter: { card: "summary_large_image", title: post.title, description: post.summary },
  };
}

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const found = await loadPost(slug);
  if (!found) notFound();
  const { post, html, sections } = found;
  const latest = (await listPosts()).filter((p) => p.slug !== post.slug).slice(0, 3);
  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.date,
    description: post.summary,
    url: `${site.url}/writing/${post.slug}`,
    author: { "@type": "Person", name: site.name, url: site.url },
  };
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return (
    <article className="wx-post" id="top">
      {!post.draft && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />}
      <PostChrome title={post.title} sections={sections} />
      <div className="wx-post-body">
        <h1 className="wx-h">{post.title}</h1>
        <dl className="wx-facts">
          <div><dt>Published</dt><dd><time dateTime={post.date}>{fmt(post.date)}</time>{post.draft && " (draft)"}</dd></div>
          <div><dt>Reading time</dt><dd>{Math.max(1, Math.round(words / 230))} min</dd></div>
          {post.topics.length > 0 && <div><dt>Topics</dt><dd>{post.topics.join(", ")}</dd></div>}
        </dl>
        <div className="prose wx-prose" dangerouslySetInnerHTML={{ __html: html }} />
        <p className="wx-endmark" aria-hidden>— End —</p>
        <aside className="wx-author">
          <p>
            <b>{site.name}</b> {site.pitch}
          </p>
          <p className="wx-author-links">
            <a href={`mailto:${site.email}`}>Email</a>
            <a href={site.links.linkedin} target="_blank" rel="noopener">LinkedIn</a>
            <a href={site.links.github} target="_blank" rel="noopener">GitHub</a>
          </p>
        </aside>
        {latest.length > 0 && (
          <section className="wx-latest" aria-label="Latest posts">
            <h2>Latest posts</h2>
            <ul>
              {latest.map((p) => (
                <li key={p.slug}>
                  <Link href={`/writing/${p.slug}`}>{p.title}</Link>
                  <time dateTime={p.date}>{fmt(p.date)}</time>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}
