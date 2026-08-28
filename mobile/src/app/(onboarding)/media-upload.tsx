// app/(onboarding)/media-upload.tsx
// Step 5: Exactly 3 Profile Photos + <1 min Introductory Video

import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import ProgressBar from "../../components/ui/ProgressBar";
import Button from "../../components/ui/Button";

export default function MediaUploadScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper
      title="Photos & Video"
      subtitle="Step 5 of 7"
      showBack={true}
    >
      <ProgressBar currentStep={5} totalSteps={7} label="Step 5: Media" />

      <Text className="text-xl font-bold text-slate-900 mb-1">
        3 Photos + Intro Video
      </Text>
      <Text className="text-sm text-slate-500 mb-6">
        Upload exactly 3 clear profile photos and an introductory video (under 1 minute) for authenticity.
      </Text>

      <View className="rounded-2xl border border-dashed border-slate-300 p-8 items-center justify-center my-4">
        <Text className="text-slate-400 font-medium text-center">
          [3 Photo Slots (Order 1, 2, 3) & Video Upload Shell]
        </Text>
      </View>

      <Button
        title="Continue to Match Preferences"
        onPress={() => router.push("/(onboarding)/preferences" as any)}
        className="mt-6"
      />
    </ScreenWrapper>
  );
}
