import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import Terminal from "./components/layout/Terminal";
import VoiceMic from "./components/layout/VoiceMic";
import Shell from "./components/ui/Shell";
import { INTRO_KEY } from "./data/package";

/** NIGHT SURVEY type: Big Shoulders Display for the condensed engineering
 *  display face, Geist to read, Geist Mono for every label and value. All
 *  three are OFL variable fonts vendored in app/fonts — no runtime fetch. */
const display = localFont({
  src: "./fonts/big-shoulders-display-latin-wght-normal.woff2",
  variable: "--font-display",
  weight: "100 900",
  display: "swap",
});
const sans = localFont({
  src: "./fonts/geist-latin-wght-normal.woff2",
  variable: "--font-sans",
  weight: "100 900",
  display: "swap",
});
const mono = localFont({
  src: "./fonts/geist-mono-latin-wght-normal.woff2",
  variable: "--font-mono",
  weight: "100 900",
  display: "swap",
});

/** Decides before first paint whether this visit opens on the sealed lid,
 *  so the hero doesn't flash before the cold open. */
const introScript = `try{if(location.pathname==="/"&&!sessionStorage.getItem("${INTRO_KEY}")&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.intro="1"}catch(e){}`;

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Shrey Singh",
  jobTitle: "AI/ML Engineer",
  address: { "@type": "PostalAddress", addressLocality: "Bengaluru", addressCountry: "IN" },
  sameAs: ["https://linkedin.com/in/9shrey", "https://github.com/9shrey"],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://9shrey.vercel.app"),
  title: {
    default: "Shrey Singh — AI/ML Engineer",
    template: "%s — Shrey Singh",
  },
  description:
    "Shrey Singh is an AI/ML engineer building fraud detection, quant RL, LLM evaluation, and GPU kernel systems, with production experience in revenue forecasting and internal ML platforms. Based in Bengaluru, India.",
  keywords: [
    "AI engineer",
    "ML engineer",
    "machine learning",
    "MLOps",
    "fraud detection",
    "XGBoost",
    "FastAPI",
    "Triton",
    "CUDA",
    "GPU kernels",
    "reinforcement learning",
    "quantitative ML",
    "LLM evaluation",
    "backend engineer",
    "Shrey Singh",
    "portfolio",
  ],
  authors: [{ name: "Shrey Singh" }],
  openGraph: {
    title: "Shrey Singh — AI/ML Engineer",
    description:
      "Building fraud detection, quant RL, LLM evaluation, and GPU kernel systems.",
    url: "https://9shrey.vercel.app",
    siteName: "Shrey Singh",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shrey Singh — AI/ML Engineer",
    description:
      "Building fraud detection, quant RL, LLM evaluation, and GPU kernel systems.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
        <a href="#content" className="skip">
          Skip to content
        </a>

        <Shell>{children}</Shell>

        <Terminal />
        <VoiceMic />
      </body>
    </html>
  );
}
