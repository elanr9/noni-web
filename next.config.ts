import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /* Scout covers and avatars, copied to storage at full size; served resized. */
    remotePatterns: [
      { protocol: "https", hostname: "zdcmmzofnrdqbwexuqnm.supabase.co", pathname: "/storage/v1/object/public/scout/**" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
