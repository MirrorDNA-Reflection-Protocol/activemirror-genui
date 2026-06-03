declare module "next-pwa" {
  import type { NextConfig } from "next";

  type PWAInitConfig = {
    dest: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    clientsClaim?: boolean;
    cleanupOutdatedCaches?: boolean;
    cacheStartUrl?: boolean;
    dynamicStartUrl?: boolean;
    reloadOnOnline?: boolean;
    runtimeCaching?: unknown[];
    publicExcludes?: string[];
    buildExcludes?: unknown[];
  };

  export default function withPWAInit(config: PWAInitConfig): (nextConfig: NextConfig) => NextConfig;
}
