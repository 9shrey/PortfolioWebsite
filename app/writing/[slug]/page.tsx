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
    <article className="wrap post">
      {post.status === "published" && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />}
      <header className="post-head">
        <nav className="ed-crumb" aria-label="Breadcrumb">
          <Link href="/writing">← Writing</Link>
        </nav>
        <h1>
          {post.title}
        </h1>
        <p className="page-lede">{post.excerpt}</p>
        <p className="post-meta mono" style={{ marginTop: 18 }}>
          <span>{post.status === "published" ? fmt(post.date) : post.status.toUpperCase()}</span>
          <span>{post.readingTime}</span>
          {post.tags?.map((t) => <span key={t}>#{t}</span>)}
        </p>
      </header>
      {post.status !== "published" && (
        <p className="draft-banner mono">
          {post.status === "template" ? "Template" : "Draft"} · only visible in development · set status: &quot;published&quot; in
          content/writing/{post.slug}.mdx to ship it
        </p>
      )}
      <div className="prose">
        <Body />
      </div>
    </article>
  );
}
