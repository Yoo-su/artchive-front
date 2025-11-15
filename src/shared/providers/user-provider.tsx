"use client";

import { ReactNode, useEffect, useState } from "react";

import { getUserProfile } from "@/features/auth/apis";
import { useAuthStore } from "@/features/auth/store";
import { FullScreenLoader } from "@/shared/components/full-screen-loader";

interface UesrProviderProps {
  children: ReactNode;
}
export default function UserProvider({ children }: UesrProviderProps) {
  const { setUser, accessToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (accessToken) {
        try {
          const user = await getUserProfile();
          setUser(user);
        } catch (error) {
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [accessToken, setUser]);

  if (isLoading) return <FullScreenLoader />;
  return <>{children}</>;
}
