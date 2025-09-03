import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "www.kopis.or.kr",
      "img1.kakaocdn.net",
      "phinf.pstatic.net",
      "shopping-phinf.pstatic.net",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  experimental: {
    serverActions: {
      // 이미지 업로드를 위해 body 크기 제한을 10MB로 늘립니다.
      // 필요에 따라 이 값을 조절할 수 있습니다.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
