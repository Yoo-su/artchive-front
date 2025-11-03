"use client";

import { useSession } from "next-auth/react";

import { FullScreenLoader } from "@/shared/components/full-screen-loader";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();

  if (status === "loading") {
    return <FullScreenLoader />;
  }

  return <>{children}</>;
}
