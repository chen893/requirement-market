/** @type {import('next').NextConfig} */
const nextConfig = {
  // 开启图片优化功能
  images: {
    domains: ['localhost'], // 允许的图片域名
    // 如果需要使用外部图片服务，在这里添加域名
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

  // 实验性功能
  experimental: {
    // 开启服务器组件
    // serverComponents: true,
    // 开启并发特性
    // concurrentFeatures: true,
  },

  // 页面扩展名
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // 禁用 x-powered-by header
  poweredByHeader: false,

  // 压缩
  compress: true,
}

module.exports = nextConfig
