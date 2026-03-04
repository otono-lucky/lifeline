import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { churchAdminService, churchService } from "../services";
import { queryKeys } from "../queryKeys";

export const useChurchAdminDashboardQuery = (
  viewedChurchAdminAccountId,
  options = {},
) =>
  useQuery({
    queryKey: queryKeys.churchAdmin.dashboard(
      viewedChurchAdminAccountId || "self",
    ),
    queryFn: () => churchAdminService.getDashboard(viewedChurchAdminAccountId),
    ...options,
  });

export const useChurchAdminMembersQuery = (churchId, params = {}, options = {}) =>
  useQuery({
    queryKey: queryKeys.churches.members(churchId, params),
    queryFn: () => churchService.getChurchMembers(churchId, params),
    enabled: Boolean(churchId) && (options.enabled ?? true),
    ...options,
  });

export const useChurchAdminCounselorsQuery = (
  churchId,
  params = {},
  options = {},
) =>
  useQuery({
    queryKey: queryKeys.churchAdmin.counselors({ churchId, ...params }),
    queryFn: () => churchAdminService.getCounselors({ churchId, ...params }),
    enabled: Boolean(churchId) && (options.enabled ?? true),
    ...options,
  });

export const useAssignCounselorMutation = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: ({ userAccountId, counselorAccountId }) =>
      churchAdminService.assignCounselor(userAccountId, counselorAccountId),
    onSuccess: (data, variables, context) => {
      if (variables?.churchId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.churches.members(variables.churchId),
        });
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.churches.all });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.churchAdmin.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.profile(variables?.userAccountId),
      });
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
};
