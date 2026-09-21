import Reveal from "../motion/Reveal";
import Magnetic from "../motion/Magnetic";
import TextReveal from "../motion/TextReveal";

const CHANNELS = [
  {
    href: "mailto:9shrey@gmail.com",
    label: "Email",
    value: "9shrey@gmail.com",
    external: false,
  },
  {
    href: "https://linkedin.com/in/9shrey",
    label: "LinkedIn",
    value: "/in/9shrey",
    external: true,
  },
  {
    href: "https://github.com/9shrey",
    label: "GitHub",
    value: "@9shrey",
    external: true,
  },
  {
    href: "/Shrey_Singh_Resume.pdf",
    label: "Resume",
    value: "PDF",
    external: true,
  },
];

export default function ContactView() {
  return (
    <div className="shell flex min-h-[80svh] flex-col justify-center pb-[clamp(5rem,12vh,9rem)] pt-[calc(var(--nav-h)+clamp(4rem,12vh,8rem))]">
      <Reveal>
        <div className="flex items-center gap-5 border-b border-[var(--rule-soft)] pb-5">
          <span className="micro !text-[var(--signal)]">Contact</span>
          <span aria-hidden className="h-px flex-1 bg-[var(--rule-soft)]" />
          <span className="micro">Bengaluru, IN</span>
        </div>
      </Reveal>

      <TextReveal
        as="h1"
        lines={["Let's build something", "that has to work."]}
        className="display mt-12 max-w-[15ch] text-[clamp(2.3rem,7vw,5.2rem)]"
      />

      <Reveal delay={240}>
        <p className="prose-dim mt-9 max-w-[54ch] text-[1.0625rem]">
          Currently building at Agneyas Labs. Always happy to talk ML systems,
          quant research, GPU kernels, and backend infrastructure — especially
          the parts that have to survive production.
        </p>
      </Reveal>

      <nav className="index-list mt-16 border-b border-[var(--rule-soft)]" aria-label="Contact channels">
        {CHANNELS.map((c, i) => (
          <Reveal key={c.label} delay={300 + i * 60}>
            <a
              href={c.href}
              {...(c.external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="index-row group flex items-baseline justify-between gap-6 py-6"
            >
              <span className="flex items-baseline gap-5">
                <span className="micro">{String(i + 1).padStart(2, "0")}</span>
                <span className="row-title display text-[clamp(1.4rem,3.2vw,2.1rem)]">
                  {c.label}
                </span>
              </span>
              <span className="flex items-baseline gap-5">
                <span className="caption hidden sm:block">{c.value}</span>
                <span
                  aria-hidden
                  className="text-[var(--fg-mute)] transition-all duration-[var(--d-1)] group-hover:translate-x-1 group-hover:text-[var(--signal)]"
                >
                  {c.external ? "↗" : "→"}
                </span>
              </span>
            </a>
          </Reveal>
        ))}
      </nav>

      <Reveal delay={560}>
        <div className="mt-14">
          <Magnetic strength={0.3}>
            <a href="mailto:9shrey@gmail.com" className="btn btn-primary">
              Start a conversation
            </a>
          </Magnetic>
        </div>
      </Reveal>
    </div>
  );
}
