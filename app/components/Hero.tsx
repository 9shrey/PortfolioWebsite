const links = [
  { href: "/Shrey_Singh_Resume.pdf", label: "Resume", external: true },
  { href: "https://github.com/9shrey", label: "GitHub", external: true },
  { href: "https://linkedin.com/in/9shrey", label: "LinkedIn", external: true },
  { href: "mailto:9shrey@gmail.com", label: "Email", external: false },
];

export default function Hero() {
  return (
    <section id="top" className="pt-36 pb-24 md:pt-44 md:pb-32">
      <div className="container-shell">
        <p className="micro enter" style={{ animationDelay: "0ms" }}>
          AI/ML Engineer — Bengaluru, IN
        </p>

        <h1
          className="display enter mt-8 text-[clamp(3.6rem,13vw,10rem)]"
          style={{ animationDelay: "80ms" }}
        >
          Shrey Singh
        </h1>

        <p
          className="enter mt-10 max-w-[38ch] text-2xl leading-snug text-[var(--fg)] md:text-3xl"
          style={{ animationDelay: "160ms" }}
        >
          I build ML systems that have to{" "}
          <span className="display display-italic text-[var(--accent)]">
            actually run
          </span>{" "}
          — forecasting pipelines, agentic workflows, and the infrastructure
          underneath them.
        </p>

        <p
          className="prose-dim enter mt-8 max-w-[60ch] text-[15px]"
          style={{ animationDelay: "240ms" }}
        >
          Currently MLOps Engineer at <strong>Agneyas Labs</strong>, building an
          internal AutoML tool and a physics-informed digital twin for battery
          life-cycle observability. Previously ML intern at{" "}
          <strong>NetApp</strong>, on revenue forecasting for $150M+ quarterly
          planning.
        </p>

        <div
          className="enter mt-12 flex flex-wrap items-center gap-x-8 gap-y-3"
          style={{ animationDelay: "320ms" }}
        >
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="link text-[15px]"
              {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
