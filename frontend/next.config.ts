import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendApiUrl =
      process.env.BACKEND_API_URL ??
      (process.env.NODE_ENV === "production"
        ? "http://16.178.242.208:3000"
        : "http://localhost:3000");
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
