/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  },
  // Enable experimental serverActions
  experimental: {},
};

export default nextConfig;
