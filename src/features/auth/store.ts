import { create } from "zustand";
import { User } from "./types";
import { publicAxios } from "@/shared/libs/axios";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoading: boolean; // ✨ 추가: 인증 상태 로딩 여부
  setAuth: (tokens: {
    accessToken: string;
    refreshToken: string;
    user: User;
  }) => void;
  clearAuth: () => void;
  refreshAccessToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isLoading: true,

  setAuth: ({ accessToken, refreshToken, user }) =>
    set({
      accessToken,
      refreshToken,
      user,
      isLoading: false, // 인증 정보가 설정되면 로딩 완료
    }),

  clearAuth: () =>
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isLoading: false, // 인증 정보가 없어도 확인이 끝났으므로 로딩 완료
    }),

  refreshAccessToken: async () => {
    const { refreshToken } = get();
    if (!refreshToken) {
      console.log("No refresh token available.");
      // ✨ 리프레시 토큰이 없을 때도 로딩 상태는 종료되어야 합니다.
      set({ isLoading: false });
      return null;
    }

    try {
      const { data } = await publicAxios.post(
        `/auth/refresh`,
        {},
        { headers: { Authorization: `Bearer ${refreshToken}` } }
      );

      const newAuthData = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: get().user!, // user 정보는 그대로 유지
      };

      // ✨ setAuth를 사용하여 isLoading 상태까지 함께 업데이트합니다.
      get().setAuth(newAuthData);
      return newAuthData.accessToken;
    } catch (error) {
      console.error("Failed to refresh access token", error);
      // 리프레시 실패 시 모든 인증 정보를 비웁니다.
      get().clearAuth();
      return null;
    }
  },
}));
