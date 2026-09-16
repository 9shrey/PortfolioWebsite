import type { Metadata } from "next";
import { Geist, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Geist({
  variable: "--font-sans-custom",
  subsets: ["latin"],
  display: "swap",
});

const serif = Instrument_Serif({
  variable: "--font-serif-custom",
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
  title: "Shrey Singh - AI/ML Engineer",
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
    title: "Shrey Singh - AI/ML Engineer",
    description:
      "Building fraud detection, quant RL, LLM evaluation, and GPU kernel systems.",
    url: "https://9shrey.vercel.app",
    siteName: "Shrey Singh",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shrey Singh - AI/ML Engineer",
    description:
      "Building fraud detection, quant RL, LLM evaluation, and GPU kernel systems.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--bg)] text-[var(--fg)]">
        {/* Scroll reveals start at opacity 0. Without JS nothing un-hides them,
            so keep the page readable instead of blank. */}
        <noscript>
          <style>{`.reveal { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
