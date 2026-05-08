import Reveal from "./Reveal";

export default function SectionHeader({
  eyebrow,
  kicker,
  title,
  text,
  numeral,
  lede,
  className = "",
}: {
  eyebrow?: string;
  kicker?: string;
  title: React.ReactNode;
  text?: string;
  numeral?: string;
  lede?: string;
  className?: string;
}) {
  const label = eyebrow ?? numeral ?? "";
  const body = text ?? lede;

  return (
    <Reveal>
      <div className={`mb-10 md:mb-14 ${className}`}>
        <div className="mb-6 flex items-center gap-3">
          {label ? <span className="micro">{label}</span> : null}
          <span className="h-px flex-1 bg-[var(--rule-soft)]" />
          {kicker ? <span className="micro text-[var(--fg-mute)]">{kicker}</span> : null}
        </div>
        <h2 className="display max-w-4xl text-balance text-4xl sm:text-5xl md:text-7xl">
          {title}
        </h2>
        {body ? (
          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--fg-dim)] md:text-lg">
            {body}
          </p>
        ) : null}
      </div>
    </Reveal>
  );
}
