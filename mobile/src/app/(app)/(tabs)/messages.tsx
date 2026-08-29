// app/(app)/(tabs)/messages.tsx
// Phase 7: Active Matches & Moderated In-App Conversations Hub

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Avatar from "../../../components/ui/Avatar";
import communicationService from "../../../services/communicationService";
import { Conversation } from "../../../types";
import { MessageCircle, ShieldCheck, Heart, ChevronRight, Lock } from "lucide-react-native";

export default function MessagesScreen() {
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      const response = await communicationService.getConversations();
      if (response.success && response.data) {
        setConversations(response.data);
      }
    } catch (err: any) {
      console.warn("Failed to load conversations:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return (
    <ScreenWrapper
      title="Conversations"
      subtitle="Moderated communications with your match & counselors"
      isScrollable={false}
    >
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : conversations.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6 text-center">
          <View className="mb-4 rounded-full bg-blue-50 p-6">
            <MessageCircle size={40} color="#2563EB" />
          </View>
          <Text className="text-xl font-bold text-slate-900 text-center mb-1">
            No Active Conversations
          </Text>
          <Text className="text-sm text-slate-500 text-center max-w-xs leading-relaxed">
            Once a match request is mutually accepted, your private couple channel and 4-party counselor channel will appear here.
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                setIsRefreshing(true);
                loadConversations();
              }}
            />
          }
        >
          <View className="gap-3 pb-8">
            {conversations.map((conv) => {
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
