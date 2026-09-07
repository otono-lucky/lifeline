// hooks/useUserProfile.ts
// TanStack React Query hook for full user profile caching & synchronization

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/userService";
import { useAuth } from "../context/AuthContext";
import { UserProfile } from "../types";

export const USER_PROFILE_QUERY_KEY = ["user-profile"];

export function useUserProfile() {
  const queryClient = useQueryClient();
  const { user, isProfileComplete, updateLocalUser } = useAuth();
  const accountId = user?.accountId || (user as any)?.id;

  const profileQuery = useQuery({
    queryKey: [...USER_PROFILE_QUERY_KEY, accountId],
    queryFn: async () => {
      if (!accountId) throw new Error("No account ID available");
      const res = await userService.getProfile(accountId);
      if (!res.success || !res.data?.user) {
        throw new Error(res.message || "Failed to fetch user profile");
      }
      return res.data.user;
    },
    // Only fetch full profile if user exists and profile is incomplete
    enabled: Boolean(accountId) && !isProfileComplete,
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
  });

  // Sync fetched full profile to local auth store so all screens have instant access
  useEffect(() => {
    if (profileQuery.data) {
      const fullProfile = profileQuery.data;
      // Ensure photos have photoUrl normalized
      const normalizedPhotos = (fullProfile.photos || []).map((p: any) => ({
        id: p.id,
        photoUrl: p.photoUrl || p.url,
        order: p.order,
      }));

      updateLocalUser({
        ...fullProfile,
        photos: normalizedPhotos,
      });
    }
  }, [profileQuery.data, updateLocalUser]);

  const invalidateProfile = () => {
    return queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY });
  };

  // Mutation for updating profile with automatic query invalidation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      if (!accountId) throw new Error("No account ID available");
      return await userService.updateProfile(accountId, data);
    },
    onSuccess: (res) => {
      if (res.data?.user) {
        updateLocalUser(res.data.user);
      }
      invalidateProfile();
    },
  });

  return {
    profile: profileQuery.data || user,
    isLoading: profileQuery.isLoading,
    isFetching: profileQuery.isFetching,
    error: profileQuery.error,
    refetch: profileQuery.refetch,
    invalidateProfile,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
  };
}
