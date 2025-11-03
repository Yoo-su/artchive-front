import axios from "axios";
import { getSession, signOut } from "next-auth/react";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

// 1. 인증이 필요 없는 공개 API용 인스턴스
export const publicAxios = axios.create({
  baseURL,
});

// 2. 인증이 필요한 API용 인스턴스
export const privateAxios = axios.create({
  baseURL,
});

export const internalAxios = axios.create({
  baseURL: "/api",
});

// privateAxios에만 요청 인터셉터 적용
privateAxios.interceptors.request.use(
  async (config) => {
    // 요청 전에 NextAuth 세션에서 최신 토큰을 가져옵니다.
    const session = await getSession();

    if (session?.accessToken) {
      config.headers["Authorization"] = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: NextAuth가 토큰 재발급 실패 시 에러를 처리
privateAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 401 에러가 발생했을 때, NextAuth 세션에 RefreshAccessTokenError가 있는지 확인
    // 이는 NextAuth가 토큰 재발급에 실패했음을 의미합니다.
    if (error.response?.status === 401) {
      const session = await getSession();
      if (session?.error === "RefreshAccessTokenError") {
        console.error("Failed to refresh token, signing out.");
        await signOut({ callbackUrl: "/login" }); // 세션 만료, 로그인 페이지로 리디렉션
      }
    }

    return Promise.reject(error);
  }
);
