import { API_PATHS } from "@/shared/constants/apis";
import { privateAxios } from "@/shared/libs/axios";

import { useAuthStore } from "./store";
import { User } from "./types";

export const getUserProfile = async () => {
  const { data: user } = await privateAxios.get<User>(API_PATHS.auth.profile);
  return user;
};

export const logout = async () => {
  await privateAxios.post(API_PATHS.auth.logout);
};
