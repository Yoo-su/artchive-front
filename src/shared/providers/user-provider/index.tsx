"use client";

import { ReactNode, useEffect, useState } from "react";

import { getUserProfile } from "@/features/auth/apis";
import { useAuthStore } from "@/features/auth/store";
import { FullScreenLoader } from "@/shared/components/full-screen-loader";

interface UesrProviderProps {
  children: ReactNode;
}
export default function UserProvider({ children }: UesrProviderProps) {
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);

    const getUesrProfile = async () => {
      const user = await getUserProfile();
      return user;
    };

    getUesrProfile()
      .then((res) => {
        setUser(res);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <FullScreenLoader />;
  return <>{children}</>;
}
