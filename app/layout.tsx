import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";
import "./art.css";

import FieldRoot from "./components/field/FieldRoot";
import FunRoot from "./components/os/FunRoot";
import SiteNav from "./components/pro/SiteNav";
import Motion from "./components/pro/Motion";
import Palette from "./components/pro/Palette";
import { projects } from "./data/projects";
import { split } from "./components/pro/ProPage";
import VisitBeacon from "./components/site/VisitBeacon";
import { MODE_SCRIPT } from "./components/mode/script";
import { site } from "./data/site";
import { listPosts } from "./lib/posts";

/** The professional site is a printed page with notes in pen: Anybody (wide,
 *  heavy) shouts, Familjen Grotesk talks, Martian Mono labels, and Nanum Pen
 *  Script is the blue ballpoint. Newsreader stays for SHREY-OS's documents.
 *  All OFL, in app/fonts. */
const serif = localFont({
  src: [
    { path: "./fonts/newsreader-var.woff2", style: "normal" },
    { path: "./fonts/newsreader-italic-var.woff2", style: "italic" },
  ],
  variable: "--font-serif",
  weight: "200 800",
  display: "swap",
});
const display = localFont({
  src: "./fonts/anybody-var.woff2",
  variable: "--font-display",
  weight: "100 900",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "50% 150%" }],
});
const sans = localFont({
  src: "./fonts/familjen-grotesk-var.woff2",
  variable: "--font-sans",
  weight: "400 700",
  display: "swap",
});
const hand = localFont({
  src: "./fonts/nanum-pen-latin.woff2",
  variable: "--font-hand",
  weight: "400",
  display: "swap",
});
const mono = localFont({
  src: "./fonts/martian-mono-var.woff2",
  variable: "--font-mono",
  weight: "100 800",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "75% 112.5%" }],
});

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.title,
  url: site.url,
  email: `mailto:${site.email}`,
  image: `${site.url}/field/portrait.png`,
  address: { "@type": "PostalAddress", addressLocality: "Bengaluru", addressCountry: "IN" },
  knowsAbout: site.knowsAbout,
  sameAs: [site.links.linkedin, site.links.github],
};

const description = `${site.name} is an ${site.title.toLowerCase()} in ${site.location}. ${site.tagline} ${site.pitch}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · ${site.title}`,
    template: `%s · ${site.name}`,
  },
  description,
  authors: [{ name: site.name, url: site.url }],
  alternates: { canonical: "/" },
  openGraph: {
    title: `${site.name} · ${site.title}`,
    description: `${site.tagline} ${site.pitch}`,
    url: "/",
    siteName: site.name,
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} · ${site.title}`,
    description: site.tagline,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ebe8df",
  colorScheme: "light",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // SHREY-OS's Writing app lists the same posts; it can't read the disk itself.
  const posts = (await listPosts()).filter((p) => p.status !== "template");
  return (
    <html
      lang="en"
      data-mode="pro"
      suppressHydrationWarning
      className={`${sans.variable} ${serif.variable} ${display.variable} ${mono.variable} ${hand.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: MODE_SCRIPT }} />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
        <a href="#content" className="skip">
          Skip to content
        </a>
        <div id="pro">
          <SiteNav />
          <main id="content" tabIndex={-1}>
            {children}
          </main>
          <footer className="foot">
            <div className="foot-in">
              <p className="foot-big" aria-hidden>
                Shrey Singh
              </p>
              <div className="foot-cols">
                <p>
                  <span className="foot-k">Contact</span>
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                  <a href={site.links.github} target="_blank" rel="noopener">
                    GitHub
                  </a>
                  <a href={site.links.linkedin} target="_blank" rel="noopener">
                    LinkedIn
                  </a>
                </p>
                <p>
                  <span className="foot-k">Pages</span>
                  <Link href="/#work">Work</Link>
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
                  <span>
                    Press <kbd>/</kbd> to jump anywhere.
                  </span>
                  <span>© {new Date().getFullYear()} {site.name}, Bengaluru.</span>
                </p>
              </div>
            </div>
          </footer>
          <Motion />
          <Palette
            projects={projects.map((p) => ({ slug: p.slug, name: split(p.title)[0], area: p.area }))}
            email={site.email}
            resume={site.resume}
            github={site.links.github}
            linkedin={site.links.linkedin}
          />
        </div>
        <div className="os-booting">
          <span aria-hidden>SHREY-OS</span>
          {/* Only appears if SHREY-OS fails to load; works without JS. */}
          <a href="?mode=pro" className="os-booting-out">
            Taking too long? Back to the professional site →
          </a>
        </div>
        <FunRoot posts={posts} />
        <FieldRoot />
        <VisitBeacon />
      </body>
    </html>
  );
}
