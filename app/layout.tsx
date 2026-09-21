import type { Metadata } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import Nav from "./components/layout/Nav";
import Footer from "./components/layout/Footer";
import Cursor from "./components/layout/Cursor";
import PageTransition from "./components/layout/PageTransition";
import ScrollProgress from "./components/layout/ScrollProgress";
import Terminal from "./components/layout/Terminal";
import SmoothScroll from "./components/motion/SmoothScroll";

/** Three voices, each with a job:
 *  - Instrument Serif carries the editorial display type.
 *  - Inter is the quiet UI voice (and has proper tabular figures, which
 *    matters on a site that is mostly numbers).
 *  - JetBrains Mono labels the data. */
const sans = Inter({
  variable: "--font-sans-custom",
  subsets: ["latin"],
  display: "swap",
});

const display = Instrument_Serif({
  variable: "--font-display-custom",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-custom",
  subsets: ["latin"],
  display: "swap",
});

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
      className={`${sans.variable} ${display.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--bg)] text-[var(--fg)]">
        {/* Scroll reveals start at opacity 0. With no JS nothing un-hides
            them, so keep the page readable rather than blank. */}
        <noscript>
          <style>{`.reveal { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>

        <a
          href="#main"
          className="micro sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[500] focus:rounded-full focus:border focus:border-[var(--signal)] focus:bg-[var(--bg)] focus:px-4 focus:py-2 focus:!text-[var(--signal)]"
        >
          Skip to content
        </a>

        <SmoothScroll />
        <Cursor />
        <ScrollProgress />
        <Nav />

        <main id="main">
          <PageTransition>{children}</PageTransition>
        </main>

        <Footer />
        <Terminal />

        <div className="vignette" aria-hidden />
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
