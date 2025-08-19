import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side webpack configuration
      config.resolve.fallback = {
        ...config.resolve.fallback,
        async_hooks: false,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        http2: false,
        assert: false,
        os: false,
        path: false,
        buffer: false,
        util: false,
        querystring: false,
        punycode: false,
        events: false,
        domain: false,
        cluster: false,
        child_process: false,
        worker_threads: false,
        vm: false,
        inspector: false,
        dns: false,
        dgram: false,
        readline: false,
        repl: false,
        string_decoder: false,
        timers: false,
        tty: false,
        v8: false,
        wasi: false,
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", port: "", pathname: "/**" },
      { protocol: "https", hostname: "i.imgur.com", port: "", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", port: "", pathname: "/**" },
      { protocol: "https", hostname: "plus.unsplash.com", port: "", pathname: "/**" },
      { protocol: "https", hostname: "www.spendwithpennies.com", port: "", pathname: "/**" },
      // Supabase Storage public buckets (adjust hostname to your project)
      { protocol: "https", hostname: "*.supabase.co", port: "", pathname: "/storage/v1/object/public/**" },
    ],
  },
};

export default nextConfig;
