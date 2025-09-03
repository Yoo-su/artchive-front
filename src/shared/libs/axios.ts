import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/features/auth/store";
import { signOut } from "next-auth/react";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

// 1. 인증이 필요 없는 공개 API용 인스턴스
export const publicAxios = axios.create({
  baseURL,
});

// 2. 인증이 필요한 API용 인스턴스
export const privateAxios = axios.create({
  baseURL,
});

// privateAxios에만 인터셉터 적용
privateAxios.interceptors.request.use(
  (config) => {
    // Zustand 스토어에서 토큰을 가져옵니다.
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

privateAxios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;

    if (error.response?.status === 401 && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;

      const newAccessToken = await useAuthStore.getState().refreshAccessToken();

      if (newAccessToken) {
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return privateAxios(originalRequest);
      } else {
        await signOut({ callbackUrl: "/login" });
      }
    }

    return Promise.reject(error);
  }
);
