/** @type {import('next').NextConfig} **/
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "replicate.com",
      "replicate.delivery",
      "user-images.githubusercontent.com",
      "upcdn.io",
      "captionary-mlart.herokuapp.com",
      "https://captionary-mlart.herokuapp.com"
    ],
  },
env: {
  REPLICATE_API_TOKEN: "96b8cc02b756e4b550990c69db621a043fadc728",
},
};
module.exports = nextConfig;
