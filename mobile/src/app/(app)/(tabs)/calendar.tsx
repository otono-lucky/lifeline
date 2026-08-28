// app/(app)/(tabs)/calendar.tsx
// Dynamic Integrated Meeting Calendar (Auto-Add State Machine)

import React from "react";
import { View, Text } from "react-native";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";

export default function CalendarScreen() {
  return (
    <ScreenWrapper
      title="Meeting Calendar"
      subtitle="Scheduled video/voice appointments & counselor check-ins"
      isScrollable={true}
    >
      <View className="rounded-3xl border border-dashed border-slate-300 p-12 items-center justify-center my-6">
        <Text className="text-slate-400 font-medium text-center">
          [Upcoming Meetings & Dynamic Event Scheduler Shell]
        </Text>
      </View>
    </ScreenWrapper>
  );
}
