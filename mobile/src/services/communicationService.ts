// services/communicationService.ts
// In-App Chat channels and Dynamic Calendar Events

import apiClient from "./apiClient";
import { ApiResponse, CalendarEvent, Conversation, Message } from "../types";

export const communicationService = {
  // List user conversations (Private Couple + 4-Party Counselor Group)
  getConversations: async () => {
    const response = await apiClient.get<ApiResponse<Conversation[]>>(
      "/communications/conversations",
    );
    return response.data;
  },

  // Get message history for conversation
  getMessages: async (
    conversationId: string,
    params?: { page?: number; limit?: number },
  ) => {
    const response = await apiClient.get<ApiResponse<Message[]>>(
      `/communications/conversations/${conversationId}/messages`,
      { params },
    );
    return response.data;
  },

  // Send message in conversation
  sendMessage: async (
    conversationId: string,
    content: string,
    mediaUrl?: string,
  ) => {
    const response = await apiClient.post<ApiResponse<Message>>(
      `/communications/conversations/${conversationId}/messages`,
      { content, mediaUrl },
    );
    return response.data;
  },

  // Propose calendar meeting event
  proposeEvent: async (
    matchId: string,
    payload: {
      title: string;
      description?: string;
      startTime: string;
      endTime: string;
      meetingLink?: string;
    },
  ) => {
    const response = await apiClient.post<ApiResponse<CalendarEvent>>(
      `/communications/matches/${matchId}/events`,
      payload,
    );
    return response.data;
  },

  // Respond to calendar event (Auto-adds on CONFIRMED)
  respondEvent: async (
    eventId: string,
    status: "CONFIRMED" | "CANCELLED",
  ) => {
    const response = await apiClient.patch<ApiResponse<CalendarEvent>>(
      `/communications/events/${eventId}/respond`,
      { status },
    );
    return response.data;
  },
};

export default communicationService;
