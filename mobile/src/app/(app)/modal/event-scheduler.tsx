// app/(app)/modal/event-scheduler.tsx
// Meeting & Event Scheduler Modal

import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";
import Button from "../../../components/ui/Button";

export default function EventSchedulerModal() {
  const router = useRouter();

  return (
    <ScreenWrapper
      title="Propose Meeting"
      subtitle="Schedule a voice or video appointment"
      showBack={true}
      onBack={() => router.back()}
    >
      <View className="rounded-3xl border border-dashed border-slate-300 p-12 items-center justify-center my-6">
        <Text className="text-slate-400 font-medium text-center">
          [Event Title, Date, Time & Meeting Link Picker Shell]
        </Text>
      </View>

      <Button
        title="Send Proposal"
        onPress={() => router.back()}
        className="mt-4"
      />
    </ScreenWrapper>
  );
}
