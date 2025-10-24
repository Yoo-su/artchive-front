"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

import { useAuthStore } from "@/features/auth/store";
import { FullScreenLoader } from "@/shared/components/full-screen-loader";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const { setAuth, clearAuth, accessToken, isLoading } = useAuthStore();

  useEffect(() => {
    // 1. NextAuth 세션 상태가 '인증됨'으로 확정되었을 때
    if (status === "authenticated") {
      const sessionData = session as any;

      // 2. 세션 데이터에 accessToken이 실제로 존재하고,
      //    Zustand 스토어가 아직 동기화되지 않았다면 동기화를 실행합니다.
      //    이 추가 검사는 불완전한 세션 객체로 인한 동기화를 방지합니다.
      if (sessionData.accessToken && !accessToken) {
        setAuth({
          accessToken: sessionData.accessToken,
          refreshToken: sessionData.refreshToken,
          user: sessionData.user,
        });
      }
    }
    // 3. NextAuth 세션 상태가 '인증되지 않음'으로 확정되었을 때 스토어를 비웁니다.
    else if (status === "unauthenticated") {
      // Zustand 스토어에 토큰이 남아있거나(로그아웃 시),
      // 아직 초기 로딩 상태일 때(비로그인 새로고침 시) clearAuth를 호출합니다.
      if (accessToken || isLoading) {
        clearAuth();
      }
    }
    // status가 'loading'일 때는 아무것도 하지 않고 기다립니다.
  }, [session, status, setAuth, clearAuth, accessToken, isLoading]);

  // NextAuth 세션 로딩이 끝나지 않았거나,
  // 우리 앱의 인증 상태 로딩이 끝나지 않았다면 로더를 보여줍니다.
  if (status === "loading" || isLoading) {
    return <FullScreenLoader />;
  }

  return <>{children}</>;
}
