import GlassCard from "./GlassCard";
import TearablePanel from "./TearablePanel";

export default function SkillGroup({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <TearablePanel className="h-full rounded-[var(--radius-lg)]" intensity={0.5} threshold={96}>
      <GlassCard className="specular-hover h-full p-5 md:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h3 className="text-base font-semibold text-[var(--fg)]">{title}</h3>
          <span className="rounded-full border border-white/70 bg-white/50 px-2.5 py-1 text-xs font-semibold text-[var(--fg-dim)]">
            {items.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span key={item} className="chip">
              {item}
            </span>
          ))}
        </div>
      </GlassCard>
    </TearablePanel>
  );
}
