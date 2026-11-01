import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendApiUrl = process.env.BACKEND_API_URL ?? "http://localhost:3000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendApiUrl}/:path*`,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
