export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-[color:var(--rule)] mt-10">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-10 md:py-14">
        <div className="grid md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-6">
            <p className="display text-4xl md:text-6xl leading-none">
              Shrey Singh<span className="display-italic">.</span>
            </p>
            <p className="mt-4 text-[color:var(--fg-dim)] max-w-md text-[15px] leading-relaxed">
              Machine Learning Engineer. Building forecasting systems that
              hold up under real-world data.
            </p>
          </div>
          <div className="md:col-span-3">
            <p className="micro mb-3">SITEMAP</p>
            <ul className="space-y-2 text-[color:var(--fg-dim)] text-sm">
              <li><a href="#about" className="link-hover">I. About</a></li>
              <li><a href="#work" className="link-hover">II. Work</a></li>
              <li><a href="#projects" className="link-hover">III. Projects</a></li>
              <li><a href="#toolkit" className="link-hover">IV. Toolkit</a></li>
              <li><a href="#contact" className="link-hover">V. Contact</a></li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <p className="micro mb-3">ELSEWHERE</p>
            <ul className="space-y-2 text-[color:var(--fg-dim)] text-sm">
              <li><a href="https://github.com/9shrey" target="_blank" rel="noreferrer" className="link-hover">GitHub ↗</a></li>
              <li><a href="https://linkedin.com/in/9shrey" target="_blank" rel="noreferrer" className="link-hover">LinkedIn ↗</a></li>
              <li><a href="mailto:9shrey@gmail.com" className="link-hover">Email</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-[color:var(--rule)] flex flex-wrap items-center justify-between gap-4">
          <p className="micro micro-dim">
            © {year} SHREY SINGH · BUILT WITH NEXT.JS &amp; TAILWIND
          </p>
          <p className="micro micro-dim">
            V 2026.04 · BENGALURU · IST
          </p>
        </div>
      </div>
    </footer>
  );
}
