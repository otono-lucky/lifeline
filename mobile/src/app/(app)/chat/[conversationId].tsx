// app/(app)/chat/[conversationId].tsx
// Phase 7: In-App Chat Room with TanStack Query & Auto-Refresh

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";
import Avatar from "../../../components/ui/Avatar";
import StateView from "../../../components/ui/StateView";
import communicationService from "../../../services/communicationService";
import { useAuth } from "../../../context/AuthContext";
import { Message } from "../../../types";
import { Send, Calendar, Lock } from "lucide-react-native";

export default function ChatConversationScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [inputText, setInputText] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  // 1. TanStack Query for Messages with polling every 3s
  const {
    data: messages = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["chatMessages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const response = await communicationService.getMessages(conversationId);
      return response.data || [];
    },
    enabled: Boolean(conversationId),
    refetchInterval: 3000, // 3s polling for real-time messaging
  });

  // 2. Send Message Mutation
  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!conversationId) throw new Error("No conversation ID");
      return await communicationService.sendMessage(conversationId, content);
    },
    onSuccess: (res) => {
      queryClient.setQueryData<Message[]>(["chatMessages", conversationId], (old = []) => [
        ...old,
        res.data as Message,
      ]);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
    onError: (err: any) => {
      console.warn("Failed to send message:", err);
    },
  });

  const handleSendMessage = () => {
    if (!inputText.trim() || !conversationId || sendMutation.isPending) return;
    const textToSend = inputText.trim();
    setInputText("");
    sendMutation.mutate(textToSend);
  };

  return (
    <ScreenWrapper
      title="Conversation Room"
      showBack={true}
      onBack={() => router.back()}
      rightAction={
        <TouchableOpacity
          onPress={() =>
            router.push(`/(app)/modal/event-scheduler?matchId=${conversationId}` as any)
          }
          className="flex-row items-center rounded-xl bg-blue-50 px-3 py-1.5 border border-blue-200"
        >
          <Calendar size={15} color="#2563EB" />
          <Text className="ml-1.5 text-xs font-bold text-blue-700">Propose Meeting</Text>
        </TouchableOpacity>
      }
      isScrollable={false}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Encryption Banner */}
        <View className="flex-row items-center justify-center py-2 bg-slate-100/80 rounded-xl mb-3 px-3">
          <Lock size={12} color="#64748B" />
          <Text className="ml-1.5 text-[11px] text-slate-500 font-medium">
            End-to-end encrypted in-app messaging • Lifeline retention policy
          </Text>
        </View>

        {isLoading ? (
          <StateView
            type="loading"
            title="Loading Chat..."
            message="Connecting to encrypted conversation channel."
          />
        ) : isError ? (
          <StateView
            type="error"
            title="Unable to Load Messages"
            message="Could not connect to conversation room."
            onRetry={refetch}
          />
        ) : (
          <ScrollView
            ref={scrollViewRef}
            className="flex-1"
            contentContainerStyle={{ paddingVertical: 8 }}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
          >
            {messages.length === 0 ? (
              <View className="py-12 items-center text-center">
                <Text className="text-sm text-slate-400 font-medium">
                  No messages yet. Send a greeting to begin!
                </Text>
              </View>
            ) : (
              messages.map((msg: Message) => {
                const isMe = msg.senderId === user?.accountId || msg.senderId === user?.id;

                return (
                  <View
                    key={msg.id}
                    className={`mb-3 flex-row ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    {!isMe && (
                      <View className="mr-2 self-end mb-1">
                        <Avatar name={msg.sender?.firstName || "Member"} size="sm" />
                      </View>
                    )}

                    <View
                      className={`max-w-[78%] rounded-2xl px-4 py-3 shadow-sm ${
                        isMe
                          ? "bg-blue-600 rounded-br-none"
                          : "bg-white border border-slate-200 rounded-bl-none"
                      }`}
                    >
                      {!isMe && (
                        <Text className="text-[11px] font-bold text-slate-500 mb-1">
                          {msg.sender?.firstName || "Counselor"}
                        </Text>
                      )}
                      <Text
                        className={`text-sm ${isMe ? "text-white" : "text-slate-900"}`}
                      >
                        {msg.content}
                      </Text>
                      <Text
                        className={`text-[9px] mt-1 text-right ${
                          isMe ? "text-blue-100" : "text-slate-400"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}

        {/* Bottom Text Input Bar */}
        <View className="flex-row items-center pt-2 pb-2 bg-slate-50">
          <View className="flex-1 flex-row items-center rounded-2xl bg-white border border-slate-300 px-4 py-2 mr-2">
            <TextInput
              placeholder="Type a message..."
              placeholderTextColor="#94A3B8"
              className="flex-1 text-sm text-slate-900"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />
          </View>

          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!inputText.trim() || sendMutation.isPending}
            className={`rounded-2xl p-3.5 items-center justify-center ${
              inputText.trim() ? "bg-blue-600 shadow-sm" : "bg-slate-300"
            }`}
          >
            {sendMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Send size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
