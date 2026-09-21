import Link from "next/link";
import Reveal from "../motion/Reveal";
import Magnetic from "../motion/Magnetic";
import TextReveal from "../motion/TextReveal";

const ELSEWHERE = [
  { href: "/experience", label: "Experience", meta: "Agneyas Labs · NetApp" },
  { href: "/about", label: "About", meta: "Background & stack" },
  { href: "/now", label: "Now", meta: "What I'm on this month" },
];

/** The closing statement. Large type, a lot of air, one clear action — the
 *  page should end on a decision rather than trailing off into a card grid. */
export default function Outro() {
  return (
    <section className="section">
      <div className="shell">
        <Reveal>
          <div className="horizon mb-16 opacity-60" />
        </Reveal>

        <Reveal>
          <TextReveal
            as="h2"
            lines={["Let's build something", "that has to work."]}
            className="display t-display max-w-[16ch]"
          />
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Magnetic strength={0.3}>
              <a href="mailto:9shrey@gmail.com" className="btn btn-primary">
                9shrey@gmail.com
              </a>
            </Magnetic>
            <Magnetic strength={0.3}>
              <Link href="/contact" className="link micro">
                Other ways to reach me
              </Link>
            </Magnetic>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <nav className="index-list mt-24" aria-label="Elsewhere on this site">
            {ELSEWHERE.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="index-row group flex items-baseline justify-between gap-6 py-6"
              >
                <span className="row-title display text-[clamp(1.5rem,3.4vw,2.25rem)]">
                  {item.label}
                </span>
                <span className="flex items-baseline gap-5">
                  <span className="caption hidden sm:block">{item.meta}</span>
                  <span
                    aria-hidden
                    className="text-[var(--fg-mute)] transition-all duration-[var(--d-1)] group-hover:translate-x-1 group-hover:text-[var(--signal)]"
                  >
                    →
                  </span>
                </span>
              </Link>
            ))}
          </nav>
        </Reveal>
      </div>
    </section>
  );
}
