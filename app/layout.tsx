import type { Metadata } from "next";
import { Instrument_Serif, Geist, JetBrains_Mono } from "next/font/google";
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
  title: "Shrey Singh — Machine Learning Engineer",
  description:
    "Shrey Singh — Machine Learning Engineer. Time series forecasting, regression modeling, scalable ML pipelines.",
  openGraph: {
    title: "Shrey Singh — Machine Learning Engineer",
    description:
      "Forecasting. Regression. Scalable ML pipelines. Bengaluru.",
    type: "website",
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
      <body className="min-h-full grain vignette">{children}</body>
    </html>
  );
}
