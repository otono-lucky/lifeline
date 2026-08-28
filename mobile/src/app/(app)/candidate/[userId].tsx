// app/(app)/candidate/[userId].tsx
// Candidate Profile Detail Modal (with 3-Slot Request Trigger)

import React from "react";
import { View, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";
import Button from "../../../components/ui/Button";

export default function CandidateDetailModal() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();

  return (
    <ScreenWrapper
      title="Candidate Profile"
      showBack={true}
      onBack={() => router.back()}
    >
      <View className="rounded-3xl border border-dashed border-slate-300 p-12 items-center justify-center my-6">
        <Text className="text-slate-400 font-medium text-center">
          [Candidate Photos Carousel, Video Preview, Bio, Church & Interests Shell]
        </Text>
      </View>

      <Button
        title="Send Match Request (1 Slot)"
        onPress={() => {}}
        className="mt-4"
      />
    </ScreenWrapper>
  );
}
