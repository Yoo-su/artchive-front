"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";

import { useAuthStore } from "../store";

interface GuestGuardProps {
  children: ReactNode;
}
export const GuestGuard = ({ children }: GuestGuardProps) => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  if (user) {
    router.push("/home");
    return;
  }

  return children;
};
