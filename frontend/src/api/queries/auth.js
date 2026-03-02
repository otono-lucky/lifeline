import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services";
import { queryKeys } from "../queryKeys";

export const useMeQuery = (options = {}) =>
  useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: authService.getMe,
    enabled: Boolean(localStorage.getItem("token")),
    ...options,
  });

export const useLoginMutation = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: ({ email, password }) => authService.login(email, password),
    onSuccess: (data, variables, context) => {
      if (data?.data?.user) {
        queryClient.setQueryData(queryKeys.auth.me(), {
          success: true,
          data: { user: data.data.user },
        });
      }
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
};

export const useSignupMutation = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: (payload) => authService.signup(payload),
    onSuccess: (data, variables, context) => {
      if (data?.data?.user) {
        queryClient.setQueryData(queryKeys.auth.me(), {
          success: true,
          data: { user: data.data.user },
        });
      }
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
};
