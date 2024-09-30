/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "framemark.vam.ac.uk", // Example hostname
        port: "", // Leave empty if not required
        pathname: "/**", // Matches all paths
      },
    ],
  },
};

export default nextConfig;
