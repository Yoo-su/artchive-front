import { queryClient } from "@/shared/constants/query-client";
import { axiosInstance } from "@/shared/libs/axios";

import { User } from "./types";

export const getUser = async () => {
  const { data: user } = await axiosInstance.get<User>("/auth/user");
  return user;
};

export const logout = async () => {
  await axiosInstance.post("/auth/logout").finally(() => {
    // Clear any client-side user state here.
    // e.g., useUserStore.getState().clearUser();
    queryClient.clear();
    if (typeof window !== "undefined") {
      // Hard redirect to the login page to clear all application state.
      //window.location.href = "/login";
    }
  });
};
