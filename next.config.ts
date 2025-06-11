/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // これが非常に重要です
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL, // これも重要です
  },
};

module.exports = nextConfig;