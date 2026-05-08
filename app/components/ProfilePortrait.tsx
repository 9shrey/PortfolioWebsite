import Image from "next/image";
import GlassCard from "./GlassCard";

const chips = ["AI/ML", "GenAI", "MLOps", "Backend"];

export default function ProfilePortrait() {
  return (
    <div className="relative mx-auto w-full max-w-[410px] lg:mr-0">
      <div className="absolute inset-8 rounded-[48px] bg-[radial-gradient(circle_at_50%_15%,rgba(111,143,232,0.32),transparent_55%)] blur-2xl" />
      <GlassCard className="relative z-10 overflow-hidden rounded-[42px] p-3 shadow-[0_32px_90px_rgba(25,34,48,0.2)]">
        <div className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-white/70 via-[#dfe7f4]/70 to-white/35">
          <Image
            src="/profile-avatar.png"
            alt="Pixel avatar portrait of Shrey Singh"
            width={900}
            height={900}
            priority
            className="aspect-square h-auto w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 rounded-[34px] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),inset_0_-40px_80px_rgba(12,18,28,0.1)]" />
        </div>
      </GlassCard>

      <div className="pointer-events-none absolute -left-7 top-8 z-20 hidden flex-col gap-2 sm:flex">
        {chips.slice(0, 2).map((chip, index) => (
          <span
            key={chip}
            className="glass-surface float-soft rounded-full px-3.5 py-2 text-xs font-semibold text-[var(--fg)]"
            style={{ animationDelay: `${index * 500}ms` }}
          >
            <span className="glass-content">{chip}</span>
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute -right-7 bottom-12 z-20 hidden flex-col gap-2 sm:flex">
        {chips.slice(2).map((chip, index) => (
          <span
            key={chip}
            className="glass-surface float-soft rounded-full px-3.5 py-2 text-xs font-semibold text-[var(--fg)]"
            style={{ animationDelay: `${900 + index * 500}ms` }}
          >
            <span className="glass-content">{chip}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
