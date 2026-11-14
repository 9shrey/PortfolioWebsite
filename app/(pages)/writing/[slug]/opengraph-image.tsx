import { OG_SIZE, renderOg } from "@/app/components/art/og";
import { listPosts, loadPost } from "@/app/lib/posts";
import { site } from "@/app/data/site";

/* The share image for a post. The page's own openGraph metadata replaces the
   site-wide image, so without this file a shared post had no picture. */

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = `A post by ${site.name}`;

export async function generateStaticParams() {
  return (await listPosts()).map((p) => ({ slug: p.slug }));
}

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = (await loadPost(slug))?.post;
  return renderOg({
    kicker: post?.date ? `Writing · ${fmt(post.date)}` : "Writing",
    title: post?.title ?? site.name,
    lede: post?.summary,
    metrics: [],
  });
}
