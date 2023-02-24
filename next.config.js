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
    REPLICATE_API_TOKEN: "",
  },
};

module.exports = nextConfig;
