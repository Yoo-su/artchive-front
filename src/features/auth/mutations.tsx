import { useMutation } from "@tanstack/react-query";

import { logout } from "./apis";

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: logout,
  });
};
