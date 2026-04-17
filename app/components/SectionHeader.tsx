import Reveal from "./Reveal";

export default function SectionHeader({
  numeral,
  kicker,
  title,
  lede,
}: {
  numeral: string;
  kicker: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
}) {
  return (
    <div className="border-t border-[color:var(--rule)] pt-8 md:pt-12">
      <div className="flex items-baseline gap-4 mb-8 md:mb-14">
        <span className="micro">{numeral}</span>
        <span className="flex-1 h-px bg-[color:var(--rule)]" />
        <span className="micro">{kicker}</span>
      </div>
      <Reveal>
        <h2 className="display text-4xl sm:text-6xl md:text-7xl max-w-5xl">
          {title}
        </h2>
      </Reveal>
      {lede && (
        <Reveal delay={120}>
          <p className="mt-6 md:mt-10 max-w-2xl text-[color:var(--fg-dim)] text-base md:text-lg leading-relaxed">
            {lede}
          </p>
        </Reveal>
      )}
    </div>
  );
}
