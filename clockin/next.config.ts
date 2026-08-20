import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/dashboard", destination: "/today", permanent: false },
      { source: "/stats", destination: "/insights", permanent: false },
      { source: "/insights/trends", destination: "/insights", permanent: false },
      { source: "/history", destination: "/insights/history", permanent: false },
      { source: "/goals", destination: "/progress", permanent: false },
      { source: "/progress/goals", destination: "/progress", permanent: false },
      { source: "/achievements", destination: "/progress/badges", permanent: false },
      { source: "/social", destination: "/progress/leaderboard", permanent: false },
      { source: "/categories", destination: "/settings/categories", permanent: false },
      { source: "/install", destination: "/settings/install", permanent: false },
      { source: "/focus-room/:id", destination: "/focus/rooms/:id", permanent: false },
    ];
  },
};

export default nextConfig;
