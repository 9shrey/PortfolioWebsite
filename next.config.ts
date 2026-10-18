import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  // Old single-page anchors and the chip site's section routes stay alive.
  async redirects() {
    return [
      { source: "/about", destination: "/#about", permanent: true },
      { source: "/experience", destination: "/#experience", permanent: true },
      { source: "/contact", destination: "/#contact", permanent: true },
      { source: "/work", destination: "/#work", permanent: true },
    ];
  },
};

// Plugins by name so Turbopack can pass them to the Rust side.
const withMDX = createMDX({
  options: { remarkPlugins: ["remark-gfm"] },
});

export default withMDX(nextConfig);
