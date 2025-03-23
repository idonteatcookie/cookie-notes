/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // 确保你的应用适合静态部署
  trailingSlash: true,  // 添加这行使URL更兼容静态托管
};

module.exports = nextConfig; 