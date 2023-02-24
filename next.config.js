/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "replicate.com",
      "replicate.delivery",
      "user-images.githubusercontent.com",
      "upcdn.io",
    ],
  },
  env: {
    REPLICATE_API_TOKEN: "f57271f05d3921a0ccbb2e3ea5737827e7fced4c",
  },
};

module.exports = nextConfig;
