"use client";

import { useGetUser } from "@/features/auth/queries";
import { FullScreenLoader } from "@/shared/components/full-screen-loader";

export default function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isError } = useGetUser();

  // 쿼리가 로딩 중일 때 (Protected 페이지에서만 해당)
  if (isLoading) {
    return <FullScreenLoader />;
  }

  // 쿼리 에러 발생 시 (Protected 페이지에서만 해당)
  // axios 인터셉터가 /login으로 리디렉션할 것이므로, 그동안 로더를 보여줌
  if (isError) {
    return <FullScreenLoader />;
  }

  // 정상적으로 사용자 정보를 불러온 경우
  return <>{children}</>;
}
