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
  
  // 添加这些配置项 - 替换 'repo-name' 为你的GitHub仓库名称
  basePath: '/repo-name', // 例如: '/cookie-work-diary'
  assetPrefix: '/repo-name/', // 注意末尾的斜杠
};

module.exports = nextConfig; 