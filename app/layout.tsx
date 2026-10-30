import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { VT323 } from "next/font/google";
import "./globals.css";
import "./art.css";

import { ROOM_SCRIPT } from "./room/script";
import VisitBeacon from "./components/site/VisitBeacon";
import "./room/room.css";
import { site } from "./data/site";

/** The professional site is a printed page with notes in pen: Anybody (wide,
 *  heavy) shouts, Familjen Grotesk talks, Martian Mono labels, and Nanum Pen
 *  Script is the blue ballpoint. Newsreader sets long-form posts.
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
/** The pixel face of the old monitor and the room's chrome (as on Felix's), OFL. */
const pixel = VT323({ weight: "400", subsets: ["latin"], variable: "--font-pixel", display: "swap" });
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

const description = `${site.name} is a ${site.title.toLowerCase()} in ${site.location}. ${site.tagline} ${site.pitch}`;

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
  themeColor: "#07080c",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-mode="pro"
      suppressHydrationWarning
      className={`${sans.variable} ${serif.variable} ${display.variable} ${mono.variable} ${hand.variable} ${pixel.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: ROOM_SCRIPT }} />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
        <a href="#content" className="skip">
          Skip to content
        </a>
        {children}
        <VisitBeacon />
      </body>
    </html>
  );
}
