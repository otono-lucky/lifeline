import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services";
import { queryKeys } from "../queryKeys";

export const useUserProfileQuery = (id, options = {}) =>
  useQuery({
    queryKey: queryKeys.users.profile(id),
    queryFn: () => userService.getProfile(id),
    enabled: Boolean(id),
    ...options,
  });

export const useUpdateUserMutation = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: ({ id, data }) => userService.updateUser(id, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.profile(variables?.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
};
