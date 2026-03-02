import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { churchService } from "../services";
import { queryKeys } from "../queryKeys";

export const useChurchesQuery = (params = {}, options = {}) =>
  useQuery({
    queryKey: queryKeys.churches.list(params),
    queryFn: () => churchService.getChurches(params),
    ...options,
  });

export const usePublicChurchesQuery = (params = {}, options = {}) =>
  useQuery({
    queryKey: queryKeys.churches.publicList(params),
    queryFn: () => churchService.getPublicChurches(params),
    ...options,
  });

export const useChurchQuery = (id, options = {}) =>
  useQuery({
    queryKey: queryKeys.churches.detail(id),
    queryFn: () => churchService.getChurch(id),
    enabled: Boolean(id),
    ...options,
  });

export const useCreateChurchMutation = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: (payload) => churchService.createChurch(payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["churches", "list"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard() });
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
};

export const useUpdateChurchMutation = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: ({ id, data }) => churchService.updateChurch(id, data),
    onSuccess: (data, variables, context) => {
      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.churches.detail(variables.id),
        });
      }
      queryClient.invalidateQueries({ queryKey: ["churches", "list"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard() });
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
};

export const useActivateChurchMutation = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: ({ id, data }) => churchService.activateChurch(id, data),
    onSuccess: (data, variables, context) => {
      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.churches.detail(variables.id),
        });
      }
      queryClient.invalidateQueries({ queryKey: ["churches", "list"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard() });
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
};
