import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ⚡ Crucial additions for GitHub Pages
  output: "export",
  basePath: "/LaunchPad-Lite", // ⚠️ REPLACE THIS with your actual repository name
  
  images: {
    unoptimized: true, // ⚠️ Required: GitHub Pages cannot run the Next.js image optimization server
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
    ],
  },
};

export default nextConfig;
