import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { matchingService } from "../services";
import { queryKeys } from "../queryKeys";

export const useActiveMatchQuery = (options = {}) =>
  useQuery({
    queryKey: queryKeys.matching.active(),
    queryFn: () => matchingService.getActiveMatch(),
    ...options,
  });

export const useActiveMatchForAccountQuery = (accountId, options = {}) =>
  useQuery({
    queryKey: queryKeys.matching.activeForAccount(accountId),
    queryFn: () => matchingService.getActiveMatchForAccount(accountId),
    enabled: Boolean(accountId) && (options.enabled ?? true),
    ...options,
  });

export const useMatchHistoryQuery = (options = {}) =>
  useQuery({
    queryKey: queryKeys.matching.history(),
    queryFn: () => matchingService.getMatchHistory(),
    ...options,
  });

export const useMatchHistoryForAccountQuery = (accountId, options = {}) =>
  useQuery({
    queryKey: queryKeys.matching.historyForAccount(accountId),
    queryFn: () => matchingService.getMatchHistoryForAccount(accountId),
    enabled: Boolean(accountId) && (options.enabled ?? true),
    ...options,
  });

export const useMatchPublicProfileQuery = (accountId, options = {}) =>
  useQuery({
    queryKey: queryKeys.matching.publicProfile(accountId),
    queryFn: () => matchingService.getPublicProfile(accountId),
    enabled: Boolean(accountId) && (options.enabled ?? true),
    ...options,
  });

export const useMatchProfileQuery = (matchId, accountId, options = {}) =>
  useQuery({
    queryKey: queryKeys.matching.matchProfile(matchId, accountId),
    queryFn: () => matchingService.getMatchProfile(matchId, accountId),
    enabled:
      Boolean(matchId) && Boolean(accountId) && (options.enabled ?? true),
    ...options,
  });

export const useMatchDetailsQuery = (matchId, options = {}) =>
  useQuery({
    queryKey: queryKeys.matching.detail(matchId),
    queryFn: () => matchingService.getMatchDetails(matchId),
    enabled: Boolean(matchId) && (options.enabled ?? true),
    ...options,
  });

export const useMatchesQuery = (params = {}, options = {}) =>
  useQuery({
    queryKey: queryKeys.matching.list(params),
    queryFn: () => matchingService.listMatches(params),
    ...options,
  });

export const useMatchDecisionMutation = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: ({ matchId, data }) => matchingService.decideMatch(matchId, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matching.active() });
      queryClient.invalidateQueries({ queryKey: queryKeys.matching.history() });
      queryClient.invalidateQueries({ queryKey: queryKeys.matching.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
};

export const useCreateManualMatchMutation = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: (payload) => matchingService.createManualMatch(payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matching.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
};

export const useEndMatchMutation = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: ({ matchId, reason }) => matchingService.endMatch(matchId, reason),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matching.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: ["counselor"] });
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
};

