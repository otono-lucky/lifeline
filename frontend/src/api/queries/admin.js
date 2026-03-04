import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService, churchService } from "../services";
import { queryKeys } from "../queryKeys";

export const useSuperAdminOverviewQuery = (options = {}) =>
  useQuery({
    queryKey: queryKeys.admin.overview(),
    queryFn: async () => {
      const [dashboardRes, churchesRes, usersRes, adminsRes, counselorsRes] =
        await Promise.all([
          adminService.getDashboard(),
          churchService.getChurches({ limit: 10 }),
          adminService.getUsers({ limit: 10 }),
          adminService.getChurchAdmins({ limit: 10 }),
          adminService.getCounsellors({ limit: 10 }),
        ]);

      return {
        success:
          dashboardRes?.success &&
          churchesRes?.success &&
          usersRes?.success &&
          adminsRes?.success &&
          counselorsRes?.success,
        data: {
          stats: dashboardRes?.data || null,
          churches: churchesRes?.data?.churches || [],
          users: usersRes?.data?.users || [],
          churchAdmins: adminsRes?.data?.churchAdmins || [],
          counselors: counselorsRes?.data?.counselors || [],
        },
      };
    },
    ...options,
  });

export const useAdminChurchesQuery = (params = {}, options = {}) =>
  useQuery({
    queryKey: queryKeys.churches.list(params),
    queryFn: () => churchService.getChurches(params),
    ...options,
  });

export const useAdminUsersQuery = (params = {}, options = {}) =>
  useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: () => adminService.getUsers(params),
    ...options,
  });

export const useAdminChurchAdminsQuery = (params = {}, options = {}) =>
  useQuery({
    queryKey: queryKeys.admin.churchAdmins(params),
    queryFn: () => adminService.getChurchAdmins(params),
    ...options,
  });

export const useAdminCounselorsQuery = (params = {}, options = {}) =>
  useQuery({
    queryKey: queryKeys.admin.counselors(params),
    queryFn: () => adminService.getCounsellors(params),
    ...options,
  });

export const useCreateChurchAdminMutation = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: (payload) => adminService.createChurchAdmin(payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "church-admins"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.overview() });
      if (onSuccess) onSuccess(data, variables, context);
    },
    ...restOptions,
  });
};

export const useAdminVerifyUserMutation = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: ({ accountId, isVerified }) =>
      adminService.verifyUser(accountId, isVerified),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.overview() });
      if (onSuccess) onSuccess(data, variables, context);
    },
    ...restOptions,
  });
};
