import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  useConversationsQuery,
  useConversationMessagesQuery,
  useSendMessageMutation,
  useCalendarEventsQuery,
  useRespondCalendarEventMutation,
} from "../api/queries/communication";
import { matchingService } from "../api/services/matchingService";
import { Toast } from "../components/Toast";

export const MonitoredChatsPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [toast, setToast] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [showEndMatchModal, setShowEndMatchModal] = useState(false);
  const [endMatchReason, setEndMatchReason] = useState("");
  const [isEndingMatch, setIsEndingMatch] = useState(false);

  const messagesEndRef = useRef(null);

  // Queries
  const conversationsQuery = useConversationsQuery();
  const messagesQuery = useConversationMessagesQuery(conversationId);
  const eventsQuery = useCalendarEventsQuery();

  // Mutations
  const sendMessageMutation = useSendMessageMutation();
  const respondEventMutation = useRespondCalendarEventMutation();

  const conversations = conversationsQuery.data?.success
    ? conversationsQuery.data.data || []
    : [];

  const messages = messagesQuery.data?.success
    ? messagesQuery.data.data || []
    : [];

  const calendarEvents = eventsQuery.data?.success
    ? eventsQuery.data.data || []
    : [];

  // Active conversation object
  const activeConversation = conversations.find(
    (c) => c.conversation?.id === conversationId || c.id === conversationId
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !conversationId) return;

    try {
      const response = await sendMessageMutation.mutateAsync({
        conversationId,
        content: messageInput.trim(),
      });

      if (response.success) {
        setMessageInput("");
      }
    } catch (err) {
      setToast({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Failed to send message",
      });
    }
  };

  const handleRespondEvent = async (eventId, decision) => {
    try {
      const response = await respondEventMutation.mutateAsync({
        eventId,
        decision,
      });

      if (response.success) {
        setToast({
          type: "success",
          message: `Meeting proposal ${decision.toLowerCase()}ed!`,
        });
      }
    } catch (err) {
      setToast({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Failed to respond to meeting proposal",
      });
    }
  };

  const handleEndCourtship = async (e) => {
    e.preventDefault();
    const matchId = activeConversation?.conversation?.matchId || activeConversation?.matchId;
    if (!matchId) {
      setToast({ type: "error", message: "Match ID not found for this courtship conversation." });
      return;
    }

    setIsEndingMatch(true);
    try {
      const res = await matchingService.endMatch(matchId, endMatchReason);
      if (res.success) {
        setToast({
          type: "success",
          message: "Courtship concluded. Mandatory Exit Debrief flagged for both candidates.",
        });
        setShowEndMatchModal(false);
        setTimeout(() => {
          navigate("/church/vetting");
        }, 1500);
      }
    } catch (err) {
      setToast({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Failed to end courtship",
      });
    } finally {
      setIsEndingMatch(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>💬</span> 3-Way Monitored Group Chats
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pastoral counselors actively monitor couple conversations, verify meeting safety, and guide courtship progression.
          </p>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px]">
        {/* Left Pane: Conversations List (4 cols) */}
        <div className="md:col-span-4 border-r border-gray-200 flex flex-col h-[600px]">
          <div className="p-3 bg-gray-50 border-b border-gray-200 font-semibold text-xs text-gray-500 uppercase tracking-wider">
            Active Monitored Courtships ({conversations.length})
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
            {conversationsQuery.isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                <p className="text-xs text-gray-400">Loading courtships...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <span className="text-2xl">🕊️</span>
                <p className="text-sm font-medium mt-1">No active monitored chats</p>
                <p className="text-xs text-gray-400 mt-1">
                  When matched couples begin chatting, the 3-way monitored room will appear here.
                </p>
              </div>
            ) : (
              conversations.map((item) => {
                const conv = item.conversation || item;
                const isSelected = conv.id === conversationId;
                const lastMsg = conv.messages?.[0];

                return (
                  <Link
                    key={conv.id}
                    to={`/church/chats/${conv.id}`}
                    className={`block p-4 transition hover:bg-indigo-50/50 ${
                      isSelected ? "bg-indigo-50 border-l-4 border-indigo-600" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-sm text-gray-900 truncate">
                        {conv.title || "Courtship Monitored Room"}
                      </h4>
                      {lastMsg && (
                        <span className="text-[10px] text-gray-400">
                          {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {lastMsg ? `${lastMsg.sender?.firstName || "Message"}: ${lastMsg.content}` : "No messages yet"}
                    </p>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Monitored Chat Room (8 cols) */}
        <div className="md:col-span-8 flex flex-col h-[600px] bg-slate-50">
          {conversationId ? (
            <>
              {/* Room Header */}
              <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                    <h3 className="font-bold text-gray-900 text-sm">
                      {activeConversation?.conversation?.title || activeConversation?.title || "Courtship Monitored Chat"}
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-100 text-purple-800 rounded-full border border-purple-200">
                      Counselor Monitored
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Messages are transparently visible to both candidates and their pastoral counselor.
                  </p>
                </div>

                <button
                  onClick={() => setShowEndMatchModal(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition"
                >
                  Conclude & Mandate Debrief
                </button>
              </div>

              {/* Proposed Meeting Event Alert (If Any) */}
              {calendarEvents.length > 0 && (
                <div className="p-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📍</span>
                    <span>
                      <strong>Meeting Proposed:</strong> Candidate requested in-person meetup. Counselor supervision requested.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRespondEvent(calendarEvents[0].id, "CONFIRMED")}
                      className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRespondEvent(calendarEvents[0].id, "DECLINED")}
                      className="px-2.5 py-1 bg-gray-200 text-gray-700 font-medium rounded hover:bg-gray-300"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              )}

              {/* Messages Thread */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messagesQuery.isLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                    <p className="text-xs text-gray-400">Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <p className="text-sm font-medium">No messages sent in this courtship room yet.</p>
                    <p className="text-xs mt-1">Start by sending an encouraging welcome message as pastoral counselor.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isCounselor = msg.sender?.id === currentUser?.id || msg.senderRole === "Counselor";
                    const isSelf = msg.sender?.id === currentUser?.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[11px] font-bold text-gray-700">
                            {msg.sender?.firstName} {msg.sender?.lastName}
                          </span>
                          {isCounselor && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-purple-600 text-white rounded">
                              Pastoral Counselor
                            </span>
                          )}
                          <span className="text-[10px] text-gray-400">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <div
                          className={`max-w-md p-3 rounded-xl text-sm ${
                            isCounselor
                              ? "bg-purple-600 text-white shadow-sm"
                              : isSelf
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "bg-white text-gray-800 border border-gray-200 shadow-sm"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Provide spiritual counsel, advice, or schedule guidance..."
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={sendMessageMutation.isPending || !messageInput.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="m-auto text-center p-8 text-gray-400">
              <span className="text-4xl block mb-2">💬</span>
              <p className="font-semibold text-gray-700">Select a Courtship Room</p>
              <p className="text-xs text-gray-400 max-w-sm mt-1">
                Choose an active courtship from the left panel to review message transcripts, approve proposed meetups, or provide guidance.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Conclude Courtship Modal */}
      {showEndMatchModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">
              Conclude Courtship & Mandate Exit Debrief
            </h3>
            <p className="text-xs text-gray-500">
              Ending this courtship will transition both candidates into <strong>DEBRIEF_REQUIRED</strong> status. They will be temporarily removed from discovery until completing an exit reflection session with you.
            </p>

            <form onSubmit={handleEndCourtship} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Reason for Conclusion / Pastoral Notes
                </label>
                <textarea
                  rows={3}
                  value={endMatchReason}
                  onChange={(e) => setEndMatchReason(e.target.value)}
                  required
                  placeholder="e.g. Mutual decision to discontinue; theological divergence regarding relocation..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEndMatchModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEndingMatch}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  {isEndingMatch ? "Concluding..." : "Conclude Courtship"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitoredChatsPage;
