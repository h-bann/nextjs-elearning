/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["schoolforsubmissives.lon1.digitaloceanspaces.com"],
  },
  async rewrites() {
    return [
      // {
      //   source: "/sitemap.xml",
      //   destination: "/api/sitemap",
      // },
      // {
      //   source: "/api/:path*",
      //   destination: process.env.NEXT_PUBLIC_API_URL + "/api/:path*",
      // },
    ];
  },
};

export default nextConfig;
