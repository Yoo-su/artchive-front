import { axiosInstance } from "@/shared/libs/axios";

import { User } from "./types";

export const getUserProfile = async () => {
  const { data: user } = await axiosInstance.get<User>("/auth/user");
  return user;
};

export const logout = async () => {
  await axiosInstance.post("/auth/logout").finally(() => {
    window.location.reload();
  });
};
