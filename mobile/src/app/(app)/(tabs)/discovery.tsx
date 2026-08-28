// app/(app)/(tabs)/discovery.tsx
// Geo-weighted Discovery Feed with 3-Slot Request Indicator

import React from "react";
import { View, Text } from "react-native";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";
import SlotCounter from "../../../components/ui/SlotCounter";

export default function DiscoveryScreen() {
  return (
    <ScreenWrapper
      title="Discovery Feed"
      subtitle="Opposite-gender verified Christian believers"
      isScrollable={true}
    >
      <View className="mb-4">
        <SlotCounter usedSlots={1} totalSlots={3} />
      </View>

      <View className="rounded-3xl border border-dashed border-slate-300 p-12 items-center justify-center my-6">
        <Text className="text-slate-400 font-medium text-center">
          [Candidate Card Deck / Proximity Feed Shell]
        </Text>
      </View>
    </ScreenWrapper>
  );
}
