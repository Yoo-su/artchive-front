import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { logout } from "@/features/auth/apis";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

export const internalAxios = axios.create({
  baseURL: "/api",
});

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // refresh 요청 자체는 재시도하지 않음
    if (originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    // 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err)); // 명시적으로 에러 reject
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosInstance.post("/auth/refresh");
        processQueue(null, null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.log("refresh error!!");
        processQueue(refreshError as AxiosError, null);

        // 로그아웃 처리
        try {
          await logout();
        } catch (logoutError) {
          console.error("logout error:", logoutError);
        }

        // 원래 요청도 명시적으로 reject
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
