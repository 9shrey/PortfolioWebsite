import Link from "next/link";
import Motion from "../components/pro/Motion";
import SiteNav from "../components/pro/SiteNav";
import { site } from "../data/site";

/** Case studies, posts, the CV and /now: printed pages you reach from the room. */
export default function PagesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div id="pro">
      <SiteNav />
      <main id="content" tabIndex={-1}>
        {children}
      </main>
      <footer className="foot">
        <div className="foot-in">
          <p className="foot-big" aria-hidden>Shrey Singh</p>
          <div className="foot-cols">
            <p>
              <span className="foot-k">Contact</span>
              <a href={`mailto:${site.email}`}>{site.email}</a>
              <a href={site.links.github} target="_blank" rel="noopener">GitHub</a>
              <a href={site.links.linkedin} target="_blank" rel="noopener">LinkedIn</a>
            </p>
            <p>
              <span className="foot-k">Pages</span>
              <Link href="/">The room</Link>
              <Link href="/writing">Writing</Link>
              <Link href="/now">Now</Link>
              <Link href="/cv">One-page CV</Link>
            </p>
            <p>
              <span className="foot-k">Colophon</span>
              <span>Set in Anybody, Familjen Grotesk, Martian Mono and a blue ballpoint.</span>
              <span>Every figure on this site traces to a public repo.</span>
            </p>
            <p>
              <span className="foot-k">Elsewhere</span>
              <span>© {new Date().getFullYear()} {site.name}, Bengaluru.</span>
            </p>
          </div>
        </div>
      </footer>
      <Motion />
    </div>
  );
}
