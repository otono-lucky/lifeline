// app/(app)/(tabs)/requests.tsx
// 3-Slot Match Request Management (Sent & Received, Blind Rejection, First-Come Acceptance)

import React from "react";
import { View, Text } from "react-native";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";
import SlotCounter from "../../../components/ui/SlotCounter";

export default function RequestsScreen() {
  return (
    <ScreenWrapper
      title="Match Requests"
      subtitle="Manage your 3 active pending slots"
      isScrollable={true}
    >
      <View className="mb-4">
        <SlotCounter usedSlots={2} totalSlots={3} />
      </View>

      <View className="rounded-3xl border border-dashed border-slate-300 p-12 items-center justify-center my-6">
        <Text className="text-slate-400 font-medium text-center">
          [Sent Requests & Received Requests Tabs Shell]
        </Text>
      </View>
    </ScreenWrapper>
  );
}
