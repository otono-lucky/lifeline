import apiClient from "../apiClient";

export const communicationService = {
  // Get all conversations user/counselor participates in
  getConversations: async () => {
    const response = await apiClient.get("/communications/conversations");
    return response.data;
  },

  // Get messages for a specific conversation
  getMessages: async (conversationId, params = {}) => {
    const response = await apiClient.get(
      `/communications/conversations/${conversationId}/messages`,
      { params }
    );
    return response.data;
  },

  // Send a message into a conversation
  sendMessage: async (conversationId, content) => {
    const response = await apiClient.post(
      `/communications/conversations/${conversationId}/messages`,
      { content }
    );
    return response.data;
  },

  // Get calendar events for couple meetups
  getEvents: async () => {
    const response = await apiClient.get("/communications/events");
    return response.data;
  },

  // Propose a meetup calendar event
  proposeEvent: async (matchId, payload) => {
    const response = await apiClient.post(
      `/communications/matches/${matchId}/events`,
      payload
    );
    return response.data;
  },

  // Respond to a meetup calendar event (accept/reject)
  respondEvent: async (eventId, payload) => {
    const response = await apiClient.patch(
      `/communications/events/${eventId}/respond`,
      payload
    );
    return response.data;
  },
};
