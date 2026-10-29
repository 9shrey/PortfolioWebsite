import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadPost, routablePosts } from "@/app/lib/posts";
import { site } from "@/app/data/site";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await routablePosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = (await routablePosts()).find((p) => p.slug === slug);
  if (!post) return {};
  const url = `/writing/${post.slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    robots: post.status === "published" ? undefined : { index: false, follow: false },
    openGraph: { title: post.title, description: post.excerpt, url, type: "article", publishedTime: post.date, siteName: site.name },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt },
  };
}

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = (await routablePosts()).find((p) => p.slug === slug);
  if (!post) notFound();
  const { default: Body } = await loadPost(slug);
  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.date,
    description: post.excerpt,
    url: `${site.url}/writing/${post.slug}`,
    author: { "@type": "Person", name: site.name, url: site.url },
  };
  return (
    <article className="wx-col wx-post">
      {post.status === "published" && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />}
      <p className="wx-back"><Link href="/writing">◂ Writing</Link></p>
      <header>
        <h1 className="wx-h">{post.title}</h1>
        <p className="wx-meta">
          {post.status === "published" ? fmt(post.date) : post.status} · {post.readingTime}
          {post.tags?.length ? <> · {post.tags.join(", ")}</> : null}
        </p>
      </header>
      {post.status !== "published" && (
        <p className="draft-banner">
          {post.status === "template" ? "Template" : "Draft"}: only visible in development. Set status: &quot;published&quot; in
          content/writing/{post.slug}.mdx to ship it.
        </p>
      )}
      <div className="prose wx-prose">
        <Body />
      </div>
      <footer className="wx-end">
        <p>Thanks for reading. Replies go to <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
        <p className="wx-back"><Link href="/writing">◂ More writing</Link></p>
      </footer>
    </article>
  );
}
