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
      "captionary-mlart.herokuapp.com"
    ],
  },
env: {
  REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
},
};

module.exports = nextConfig;
