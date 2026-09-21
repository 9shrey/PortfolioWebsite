import TextReveal from "../motion/TextReveal";
import Reveal from "../motion/Reveal";

/** Standard page opening: a meta rail, a large display title that reveals by
 *  line, and an optional lead. No icon-in-a-circle — the rule and the mono
 *  label already do that job, and doing both is how a page starts looking
 *  like a landing-page template. */
export default function PageHeader({
  kicker,
  meta,
  lines,
  lead,
}: {
  kicker: string;
  meta?: string;
  lines: string[];
  lead?: string;
}) {
  return (
    <header className="pt-[calc(var(--nav-h)+clamp(4rem,12vh,8rem))]">
      <Reveal>
        <div className="flex items-center gap-5 border-b border-[var(--rule-soft)] pb-5">
          <span className="micro !text-[var(--signal)]">{kicker}</span>
          <span aria-hidden className="h-px flex-1 bg-[var(--rule-soft)]" />
          {meta ? <span className="micro">{meta}</span> : null}
        </div>
      </Reveal>

      <TextReveal
        as="h1"
        lines={lines}
        className="display t-display mt-10 max-w-[16ch] md:mt-14"
      />

      {lead ? (
        <Reveal delay={200}>
          <p className="prose-dim mt-8 max-w-[58ch] text-[1.0625rem]">{lead}</p>
        </Reveal>
      ) : null}
    </header>
  );
}
