import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "shared.akamai.steamstatic.com", pathname: "/store_item_assets/steam/apps/**" },
      { protocol: "https", hostname: "shared.fastly.steamstatic.com", pathname: "/store_item_assets/steam/apps/**" },
      { protocol: "https", hostname: "shared.cloudflare.steamstatic.com", pathname: "/store_item_assets/steam/apps/**" },
      { protocol: "https", hostname: "cdn.cloudflare.steamstatic.com", pathname: "/**" },
      { protocol: "https", hostname: "cdn.fastly.steamstatic.com", pathname: "/**" },
      { protocol: "https", hostname: "cdn.akamai.steamstatic.com", pathname: "/**" },
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/**" },
      { protocol: "https", hostname: "www.rockstargames.com", pathname: "/VI/**" },
      { protocol: "https", hostname: "upload.wikimedia.org", pathname: "/**" },
      { protocol: "https", hostname: "commons.wikimedia.org", pathname: "/**" },
    ],
  },
};

export default nextConfig;
