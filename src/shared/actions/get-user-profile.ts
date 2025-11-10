"use server";

import { cookies } from "next/headers";

import { User } from "@/features/auth/types";

export async function getUserProfile(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken");

  if (!token) {
    return null;
  }

  try {
    const BACKEND_URL = process.env.API_URL;
    const response = await fetch(`${BACKEND_URL}/auth/user`, {
      headers: {
        Cookie: `accessToken=${token.value}`,
      },
      cache: "no-store",
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}
