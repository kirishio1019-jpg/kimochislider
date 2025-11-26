import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  // トラブルシューティング用の設定
  reactStrictMode: true,
  // 静的ファイルの配信設定
  trailingSlash: false,
};

export default nextConfig;
