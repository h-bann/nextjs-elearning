/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      `${process.env.DO_SPACES_NAME}.${process.env.DO_SPACES_REGION}.digitaloceanspaces.com`,
    ],
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
