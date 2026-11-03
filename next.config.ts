import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

export default nextConfig;
