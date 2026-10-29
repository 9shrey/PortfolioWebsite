import Link from "next/link";

/** The bar on case studies, posts and the CV. Everything else lives in the room at /. */
const LINKS = [
  { href: "/#work", label: "Work" },
  { href: "/#about", label: "About" },
  { href: "/#writing", label: "Writing" },
  { href: "/#year", label: "Year" },
  { href: "/#contact", label: "Contact" },
];

export default function SiteNav() {
  return (
    <header className="nav">
      <div className="nav-in">
        <Link href="/" className="nav-name" aria-label="Shrey Singh, back to the room">
          Shrey Singh
        </Link>
        <nav aria-label="Primary" className="nav-links">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>
      </div>
    </header>
  );
}
