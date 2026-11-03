import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listPosts, loadPost } from "@/app/lib/posts";
import { site } from "@/app/data/site";

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
  const { post, html } = found;
  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.date,
    description: post.summary,
    url: `${site.url}/writing/${post.slug}`,
    author: { "@type": "Person", name: site.name, url: site.url },
  };
  return (
    <article className="wx-col">
      {!post.draft && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />}
      <p className="wx-back"><Link href="/writing">◂ Writing</Link></p>
      <h1 className="wx-h">{post.title}</h1>
      <p className="wx-meta">
        <time dateTime={post.date}>{fmt(post.date)}</time>
        {post.draft && " · draft"}
      </p>
      <div className="prose wx-prose" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
