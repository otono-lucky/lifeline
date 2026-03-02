import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services";
import { queryKeys } from "../queryKeys";

export const useMyProfileQuery = (options = {}) =>
  useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: userService.getProfile,
    enabled: Boolean(localStorage.getItem("token")),
    ...options,
  });

export const useUpdateMyProfileMutation = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: (payload) => userService.updateProfile(payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
};
