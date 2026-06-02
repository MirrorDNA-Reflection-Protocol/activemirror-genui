declare module "next-pwa" {
  import type { NextConfig } from "next";

  type PWAInitConfig = {
    dest: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
  };

  export default function withPWAInit(config: PWAInitConfig): (nextConfig: NextConfig) => NextConfig;
}
