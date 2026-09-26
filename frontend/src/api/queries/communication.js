import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { communicationService } from "../services";

export const useConversationsQuery = (options = {}) =>
  useQuery({
    queryKey: ["communications", "conversations"],
    queryFn: () => communicationService.getConversations(),
    staleTime: 1000 * 30, // 30 seconds
    ...options,
  });

export const useConversationMessagesQuery = (
  conversationId,
  params = {},
  options = {},
) =>
  useQuery({
    queryKey: ["communications", "messages", conversationId, params],
    queryFn: () => communicationService.getMessages(conversationId, params),
    enabled: Boolean(conversationId),
    refetchInterval: 5000, // Poll every 5s for chat updates
    ...options,
  });

export const useSendMessageMutation = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: ({ conversationId, content }) =>
      communicationService.sendMessage(conversationId, content),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ["communications", "messages", variables.conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["communications", "conversations"],
      });
      if (onSuccess) onSuccess(data, variables, context);
    },
    ...restOptions,
  });
};

export const useCalendarEventsQuery = (options = {}) =>
  useQuery({
    queryKey: ["communications", "events"],
    queryFn: () => communicationService.getEvents(),
    ...options,
  });

export const useRespondCalendarEventMutation = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: ({ eventId, decision }) =>
      communicationService.respondEvent(eventId, { decision }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ["communications", "events"],
      });
      if (onSuccess) onSuccess(data, variables, context);
    },
    ...restOptions,
  });
};
