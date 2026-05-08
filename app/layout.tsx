import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Geist({
  variable: "--font-sans-custom",
  subsets: ["latin"],
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
    "Shrey Singh is an AI/ML engineer building agentic systems, GenAI products, MLOps pipelines, forecasting infrastructure, quantitative ML research tools, and backend systems. Based in Bengaluru, India.",
  keywords: [
    "AI engineer",
    "ML engineer",
    "machine learning",
    "MLOps",
    "GenAI",
    "RAG",
    "agentic AI",
    "forecasting infrastructure",
    "quantitative ML",
    "backend engineer",
    "Shrey Singh",
    "portfolio",
  ],
  authors: [{ name: "Shrey Singh" }],
  openGraph: {
    title: "Shrey Singh - AI/ML Engineer",
    description:
      "Building agentic systems, GenAI products, MLOps pipelines, forecasting infrastructure, and backend systems.",
    url: "https://9shrey.vercel.app",
    siteName: "Shrey Singh",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shrey Singh - AI/ML Engineer",
    description:
      "Building agentic systems, GenAI products, MLOps pipelines, forecasting infrastructure, and backend systems.",
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
    <html lang="en" className={`${sans.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full bg-[var(--bg)] text-[var(--fg)]">
        {children}
      </body>
    </html>
  );
}
