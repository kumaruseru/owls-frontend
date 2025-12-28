import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 1. Kích hoạt React Strict Mode để dev tốt hơn */
  reactStrictMode: true,

  /* 2. Cấu hình hình ảnh (Dùng remotePatterns thay cho domains) */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'owls.asia', // ⚠️ Thay bằng domain thật của bạn (VD: api.owlstore.com)
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.owls.asia',
        port: '',
        pathname: '/**',
      },
      // Nếu bạn chạy backend ở localhost thì mở comment dòng dưới:
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/**',
      },
    ],
    // Tăng thời gian cache ảnh (tùy chọn)
    minimumCacheTTL: 60,
  },

  /* 3. Các tính năng thử nghiệm (React Compiler nằm ở đây) */
  experimental: {
    // reactCompiler: true, // properties 'reactCompiler' does not exist in type 'ExperimentalConfig'
    optimizePackageImports: ['lucide-react', 'framer-motion'], // Gợi ý: Tối ưu load thư viện
  },
};

export default nextConfig;
