import type { NextConfig } from "next"

function backendImageHost() {
  const url =
    process.env.MEDUSA_BACKEND_URL ||
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  if (!url) return null
  try {
    const u = new URL(url)
    return {
      protocol: u.protocol.replace(":", "") as "http" | "https",
      hostname: u.hostname,
    }
  } catch {
    return null
  }
}

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  trailingSlash: false,
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "mercur-connect.s3.eu-central-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "api.mercurjs.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "192.168.86.70",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "api-sandbox.mercurjs.com",
        pathname: "/static/**",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },
      {
        protocol: "https",
        hostname: "s3.eu-central-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      ...(process.env.NEXT_PUBLIC_MINIO_ENDPOINT ? [{
        protocol: "https" as const,
        hostname: process.env.NEXT_PUBLIC_MINIO_ENDPOINT,
      }] : []),
      ...(backendImageHost() ? [backendImageHost()!] : []),
    ],
  },
}

module.exports = nextConfig
