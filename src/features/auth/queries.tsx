"use client";

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { usePathname } from "next/navigation";

import { PUBLIC_ROUTES } from "@/shared/constants/public-routes";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { getUser } from "./apis";
import { User } from "./types";

// 1. 실제 사용되는 queryKey의 타입을 typeof를 사용해 정확하게 추론합니다.
type UserQueryKey = typeof QUERY_KEYS.authKeys.user.queryKey;

// 2. UseQueryOptions의 제네릭에 추론된 키 타입과 User, Error 타입을 명시합니다.
type UseGetUserOptions = Omit<
  UseQueryOptions<User, AxiosError, User, UserQueryKey>,
  "queryKey" | "queryFn"
>;

// 3. useGetUser의 파라미터에 새로 정의한 타입을 적용합니다.
export const useGetUser = (options?: UseGetUserOptions) => {
  const pathname = usePathname();

  const isPublicPage = PUBLIC_ROUTES.some((path) => pathname.startsWith(path));

  return useQuery({
    queryKey: QUERY_KEYS.authKeys.user.queryKey,
    queryFn: getUser,
    retry: 0,
    staleTime: Infinity,
    enabled: !isPublicPage,
    ...options,
  });
};
