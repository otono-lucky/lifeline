// app/(app)/(tabs)/messages.tsx
// Active Matches & Conversations Hub (Couple Private & 4-Party Counselor Group Channels)

import React from "react";
import { View, Text } from "react-native";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";

export default function MessagesScreen() {
  return (
    <ScreenWrapper
      title="Conversations"
      subtitle="Moderated communications with your match & counselor"
      isScrollable={true}
    >
      <View className="rounded-3xl border border-dashed border-slate-300 p-12 items-center justify-center my-6">
        <Text className="text-slate-400 font-medium text-center">
          [Couple Private Chat & Counselor-Guided Group Chat List Shell]
        </Text>
      </View>
    </ScreenWrapper>
  );
}
