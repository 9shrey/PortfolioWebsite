import Link from "next/link";
import PageHeader from "../ui/PageHeader";
import Reveal from "../motion/Reveal";
import { posts } from "@/app/data/writing";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function WritingIndexView() {
  return (
    <div className="shell pb-[clamp(5rem,12vh,9rem)]">
      <PageHeader
        kicker="Writing"
        meta={posts.length ? `${posts.length} notes` : "Nothing published yet"}
        lines={["Notes from", "the systems."]}
        lead="Short technical write-ups on specific decisions from the projects — the kind of detail that doesn't fit in a project card but is the actual reason something worked."
      />

      {posts.length === 0 ? (
        <Reveal delay={260}>
          <div className="mt-20 border-t border-[var(--rule-soft)] py-16">
            <p className="micro">Empty</p>
            <p className="prose-dim mt-4 max-w-[48ch] text-[0.9375rem]">
              Nothing published here yet — first notes are on the way. In the
              meantime, every project case study carries its own{" "}
              <em>challenges</em> and <em>what I&apos;d do differently</em>{" "}
              sections.
            </p>
            <Link href="/work" className="link micro mt-8 inline-block">
              Read the case studies →
            </Link>
          </div>
        </Reveal>
      ) : (
        <div className="index-list mt-20 border-b border-[var(--rule-soft)]">
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 60}>
              <Link href={`/writing/${post.slug}`} className="index-row block py-8">
                <div className="grid gap-x-10 gap-y-3 md:grid-cols-[9rem_1fr]">
                  <span className="micro pt-1.5">
                    {formatDate(post.date)} · {post.readingTime}
                  </span>
                  <div>
                    <h2 className="row-title display text-[clamp(1.4rem,3vw,2rem)]">
                      {post.title}
                    </h2>
                    <p className="prose-dim mt-2.5 max-w-[62ch] text-sm">
                      {post.excerpt}
                    </p>
                    <div className="mt-3.5 flex flex-wrap gap-x-3.5 gap-y-1.5">
                      {post.tags.map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
