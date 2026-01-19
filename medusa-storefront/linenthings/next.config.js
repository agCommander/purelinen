const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    staticGenerationRetryCount: 3,
    staticGenerationMaxConcurrency: 1,
  },
  // Set site name via environment variable (defaults to 'linenthings')
  // This works similar to htaccess in Magento - determines site identity
  env: {
    NEXT_PUBLIC_STORE_NAME: process.env.NEXT_PUBLIC_STORE_NAME || process.env.STORE_NAME || 'linenthings',
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "fashion-starter-demo.s3.eu-central-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "purelinen.com.au",
      },
      {
        protocol: "https",
        hostname: "linenthings.com.au",
      },
    ],
  },
}

module.exports = nextConfig
