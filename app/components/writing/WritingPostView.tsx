import Link from "next/link";
import Reveal from "../motion/Reveal";
import TextReveal from "../motion/TextReveal";
import type { Post } from "@/app/data/writing";
import { getProjectBySlug } from "@/app/data/projects";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function WritingPostView({ post }: { post: Post }) {
  const related = post.relatedProject
    ? getProjectBySlug(post.relatedProject)
    : undefined;

  return (
    <article className="shell-narrow pb-[clamp(5rem,12vh,9rem)] pt-[calc(var(--nav-h)+clamp(3rem,8vh,5rem))]">
      <Reveal>
        <Link href="/writing" className="link-quiet micro">
          ← All notes
        </Link>
      </Reveal>

      <Reveal delay={60}>
        <p className="micro mt-10">
          {formatDate(post.date)} · {post.readingTime}
        </p>
      </Reveal>

      <TextReveal
        as="h1"
        lines={[post.title]}
        className="display mt-5 text-[clamp(2rem,5.5vw,3.5rem)]"
      />

      <Reveal delay={220}>
        <div className="mt-5 flex flex-wrap gap-x-3.5 gap-y-1.5">
          {post.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </Reveal>

      <div className="mt-12 space-y-6 border-t border-[var(--rule-soft)] pt-10">
        {post.body.map((paragraph, i) => (
          <Reveal key={i}>
            {/* Post bodies are authored by hand in app/data/writing.ts — this
                is first-party content, not anything fetched or user-supplied. */}
            <p
              className="prose-dim text-[1.0625rem]"
              dangerouslySetInnerHTML={{ __html: paragraph }}
            />
          </Reveal>
        ))}
      </div>

      {related ? (
        <Reveal>
          <div className="mt-14 border-t border-[var(--rule-soft)] pt-8">
            <span className="micro">From the project</span>
            <Link
              href={`/work/${related.slug}`}
              className="link display mt-3 block text-[clamp(1.3rem,3vw,1.9rem)]"
            >
              {related.title} →
            </Link>
          </div>
        </Reveal>
      ) : null}
    </article>
  );
}
