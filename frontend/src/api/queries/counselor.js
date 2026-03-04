import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { counselorService } from "../services";
import { queryKeys } from "../queryKeys";

export const useCounselorDashboardQuery = (accountId, options = {}) =>
  useQuery({
    queryKey: queryKeys.counselor.dashboard(accountId || "self"),
    queryFn: () => counselorService.getDashboard(accountId),
    ...options,
  });

export const useCounselorAssignedUsersQuery = (
  accountId,
  params = {},
  options = {},
) =>
  useQuery({
    queryKey: queryKeys.counselor.assignedUsers(accountId || "self", params),
    queryFn: () => counselorService.getAssignedUsers(params, accountId),
    ...options,
  });

export const useVerifyCounselorUserMutation = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: ({ userAccountId, status, notes }) =>
      counselorService.verifyUser(userAccountId, status, notes),
    onSuccess: (data, variables, context) => {
      const scopedAccountId = variables?.viewedCounselorAccountId || "self";
      queryClient.invalidateQueries({
        queryKey: queryKeys.counselor.dashboard(scopedAccountId),
      });
      queryClient.invalidateQueries({
        queryKey: ["counselor", "assigned-users", scopedAccountId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
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
