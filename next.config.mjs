/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "framemark.vam.ac.uk",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.europeana.eu",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
