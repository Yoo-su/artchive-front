"use client";

import { ReactNode, useEffect, useState } from "react";

import { useAuthStore } from "@/features/auth/store";
import { User } from "@/features/auth/types";
import { FullScreenLoader } from "@/shared/components/full-screen-loader";

interface UesrProviderProps {
  user: User | null;
  children: ReactNode;
}
export default function UserProvider({ user, children }: UesrProviderProps) {
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setUser(user);
    setIsLoading(false);
  }, [user]);

  if (isLoading) return <FullScreenLoader />;
  return <>{children}</>;
}
