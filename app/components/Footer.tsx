export default function Footer() {
  return (
    <footer className="border-t border-white/60 bg-white/28 backdrop-blur-xl">
      <div className="container-shell flex flex-col gap-6 py-8 text-sm text-[var(--fg-dim)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-[var(--fg)]">Shrey Singh</p>
          <p>AI/ML Engineer &middot; Bengaluru, IN</p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 font-medium">
          <a href="https://github.com/9shrey" target="_blank" rel="noreferrer" className="link-hover">
            GitHub
          </a>
          <a href="https://linkedin.com/in/9shrey" target="_blank" rel="noreferrer" className="link-hover">
            LinkedIn
          </a>
          <a href="mailto:9shrey@gmail.com" className="link-hover">
            Email
          </a>
          <span>Built with Next.js &amp; Tailwind</span>
        </div>
      </div>
    </footer>
  );
}
