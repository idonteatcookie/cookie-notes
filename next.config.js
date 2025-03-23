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
  
  // 替换下面的 "cookie-notes" 为您的实际仓库名称
  basePath: '/cookie-notes',  // 使用实际仓库名，而不是 'repo-name'
  assetPrefix: '/cookie-notes/',  // 末尾需要斜杠
};

module.exports = nextConfig; 