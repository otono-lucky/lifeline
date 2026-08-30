// app/(app)/(tabs)/messages.tsx
// Phase 7: Active Matches & Moderated In-App Conversations Hub with TanStack Query

import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Avatar from "../../../components/ui/Avatar";
import StateView from "../../../components/ui/StateView";
import communicationService from "../../../services/communicationService";
import { Conversation } from "../../../types";
import { MessageCircle, ChevronRight } from "lucide-react-native";

export default function MessagesScreen() {
  const router = useRouter();

  const {
    data: conversations = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await communicationService.getConversations();
      return response.data || [];
    },
    refetchInterval: 10000, // Poll every 10s for real-time conversation updates
  });

  return (
    <ScreenWrapper
      title="Conversations"
      subtitle="Moderated communications with your match & counselors"
      isScrollable={false}
    >
      {isLoading ? (
        <StateView
          type="loading"
          title="Loading Conversations..."
          message="Fetching active couple and counselor channels."
        />
      ) : isError ? (
        <StateView
          type="error"
          title="Unable to Load Conversations"
          message={error instanceof Error ? error.message : "Failed to load chats."}
          onRetry={refetch}
        />
      ) : conversations.length === 0 ? (
        <StateView
          type="empty"
          icon={<MessageCircle size={40} color="#2563EB" />}
          title="No Active Conversations"
          message="Once a match request is mutually accepted, your private couple channel and 4-party counselor channel will appear here."
          actionTitle="Refresh"
          onAction={refetch}
        />
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
            />
          }
        >
          <View className="gap-3 pb-8">
            {conversations.map((conv: Conversation) => {
              const isGroup = conv.type === "COUNSELOR_GROUP";
              const title =
                conv.title ||
                (isGroup
                  ? "Counselor-Guided Group Chat"
                  : "Private Couple Channel");

              const otherParticipant = conv.participants?.find((p) => p.role === "User");
              const photo = otherParticipant?.user?.photos?.[0]?.photoUrl;

              return (
                <TouchableOpacity
                  key={conv.id}
                  onPress={() => router.push(`/(app)/chat/${conv.id}` as any)}
                  activeOpacity={0.8}
                >
                  <Card className="border border-slate-200 p-4 shadow-sm">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1 mr-3">
                        <Avatar
                          url={photo}
                          name={title}
                          size="md"
                          isCounselor={isGroup}
                          isVerified={!isGroup}
                        />

                        <View className="ml-3 flex-1">
                          <View className="flex-row items-center gap-1.5 mb-1">
                            <Text
                              className="text-base font-bold text-slate-900"
                              numberOfLines={1}
                            >
                              {title}
                            </Text>
                            {isGroup ? (
                              <Badge label="4-Party Moderated" variant="purple" />
                            ) : (
                              <Badge label="Private Encrypted" variant="primary" />
                            )}
                          </View>

                          <Text
                            className="text-xs text-slate-500"
                            numberOfLines={1}
                          >
                            {conv.lastMessage?.content ||
                              (isGroup
                                ? "Counselor guidance channel active."
                                : "Say hello to your match!")}
                          </Text>
                        </View>
                      </View>

                      <ChevronRight size={20} color="#94A3B8" />
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}
    </ScreenWrapper>
  );
}
