export default function Footer() {
  return (
    <footer className="border-t border-[var(--rule-soft)]">
      <div className="container-shell flex flex-col gap-4 py-10 md:flex-row md:items-center md:justify-between">
        <p className="micro">Shrey Singh — Bengaluru, IN</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <a
            href="https://github.com/9shrey"
            target="_blank"
            rel="noreferrer"
            className="micro hover:!text-[var(--accent)]"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/9shrey"
            target="_blank"
            rel="noreferrer"
            className="micro hover:!text-[var(--accent)]"
          >
            LinkedIn
          </a>
          <a
            href="mailto:9shrey@gmail.com"
            className="micro hover:!text-[var(--accent)]"
          >
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
