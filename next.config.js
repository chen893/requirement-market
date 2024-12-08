/** @type {import('next').NextConfig} */
const nextConfig = {
  // 开启图片优化功能
  images: {
    domains: ['localhost'], // 允许的图片域名
  },
  
  // 严格模式，用于捕获潜在问题
  reactStrictMode: true,
  
  // 输出目录
  distDir: '.next',
  
  // 开启 SWC 压缩
  swcMinify: true,
  
  // 环境变量前缀
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  
  // 实验性功能 - 更新为最新的配置
  experimental: {
    // serverComponents 已经默认启用，无需显式配置
    // concurrentFeatures 已被移除
    serverActions: true,
  },
  
  // 页面扩展名
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // 禁用 x-powered-by header
  poweredByHeader: false,
  
  // 压缩
  compress: true,
};

module.exports = nextConfig;