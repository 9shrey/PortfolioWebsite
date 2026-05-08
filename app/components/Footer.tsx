export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-[var(--rule-soft)] bg-[var(--bg-2)]">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8 py-10 md:py-14">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div>
            <p className="display text-4xl md:text-5xl leading-none">
              Shrey Singh<span className="display-italic">.</span>
            </p>
            <p className="mt-3 text-[var(--fg-dim)] text-[15px] leading-relaxed max-w-sm">
              AI/ML engineer building agentic systems, MLOps pipelines, and
              backend infrastructure.
            </p>
          </div>
          <div className="md:text-right">
            <p className="micro mb-3">Elsewhere</p>
            <ul className="space-y-1.5 text-sm text-[var(--fg-dim)]">
              <li>
                <a
                  href="https://github.com/9shrey"
                  target="_blank"
                  rel="noreferrer"
                  className="link-hover"
                >
                  GitHub ↗
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com/in/9shrey"
                  target="_blank"
                  rel="noreferrer"
                  className="link-hover"
                >
                  LinkedIn ↗
                </a>
              </li>
              <li>
                <a href="mailto:9shrey@gmail.com" className="link-hover">
                  Email
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--rule-soft)] flex flex-wrap items-center justify-between gap-3">
          <p className="micro micro-dim">
            &copy; {year} Shrey Singh &middot; Built with Next.js &amp; Tailwind
          </p>
          <p className="micro micro-dim">Bengaluru, IN &middot; IST</p>
        </div>
      </div>
    </footer>
  );
}
