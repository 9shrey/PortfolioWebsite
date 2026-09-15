import Reveal from "./Reveal";

export default function SectionHeader({
  numeral,
  kicker,
  title,
  text,
  className = "",
}: {
  numeral?: string;
  kicker?: string;
  title: React.ReactNode;
  text?: string;
  className?: string;
}) {
  return (
    <Reveal>
      <div className={`mb-12 md:mb-16 ${className}`}>
        <div className="mb-8 flex items-center gap-4">
          {numeral ? <span className="micro">{numeral}</span> : null}
          <span className="h-px flex-1 bg-[var(--rule-soft)]" />
          {kicker ? <span className="micro">{kicker}</span> : null}
        </div>

        <h2 className="display max-w-[20ch] text-balance text-[clamp(2.4rem,6vw,4.25rem)]">
          {title}
        </h2>

        {text ? (
          <p className="prose-dim mt-6 max-w-[58ch] text-[15px]">{text}</p>
        ) : null}
      </div>
    </Reveal>
  );
}
