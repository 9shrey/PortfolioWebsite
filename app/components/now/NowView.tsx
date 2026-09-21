import PageHeader from "../ui/PageHeader";
import Reveal from "../motion/Reveal";
import { nowItems, updated } from "@/app/data/now";

export default function NowView() {
  return (
    <div className="shell pb-[clamp(5rem,12vh,9rem)]">
      <PageHeader
        kicker="Now"
        meta={`Updated ${updated}`}
        lines={["What I'm doing", "right now."]}
        lead="A /now page, not a résumé — this is what's actually on my plate this month, updated when it changes rather than when I remember to."
      />

      <div className="mt-20 border-b border-[var(--rule-soft)]">
        {nowItems.map((item, i) => (
          <Reveal key={item.label} delay={i * 60}>
            <div className="grid gap-x-10 gap-y-3 border-t border-[var(--rule-soft)] py-8 md:grid-cols-[11rem_1fr]">
              <h2 className="micro flex items-baseline gap-3 pt-1.5">
                <span className="!text-[var(--signal)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item.label}
              </h2>
              <p className="prose-dim max-w-[64ch] text-[0.9375rem]">
                {item.text}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
