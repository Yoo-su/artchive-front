"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";

import { useAuthStore } from "../store";

interface AuthGuardProps {
  children: ReactNode;
}
export const AuthGuard = ({ children }: AuthGuardProps) => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  if (!user) {
    router.push("/login");
    return;
  }

  return children;
};
