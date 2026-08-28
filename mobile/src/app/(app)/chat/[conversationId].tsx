// app/(app)/chat/[conversationId].tsx
// In-App Chat Room (Couple Private Channel & 4-Party Counselor Group Channel)

import React from "react";
import { View, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";

export default function ChatConversationScreen() {
  const { conversationId } = useLocalSearchParams();
  const router = useRouter();

  return (
    <ScreenWrapper
      title="Conversation"
      subtitle={`Room: ${conversationId}`}
      showBack={true}
      onBack={() => router.back()}
      isScrollable={false}
    >
      <View className="flex-1 rounded-3xl border border-dashed border-slate-300 p-8 items-center justify-center my-4">
        <Text className="text-slate-400 font-medium text-center">
          [Encrypted Messaging Stream & Dynamic Calendar Proposal Trigger Shell]
        </Text>
      </View>
    </ScreenWrapper>
  );
}
