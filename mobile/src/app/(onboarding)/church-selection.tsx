// app/(onboarding)/church-selection.tsx
// Step 1: Church Selection (Standardized Parent-Branch RCCG vs Individual Parish)

import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import ProgressBar from "../../components/ui/ProgressBar";
import Button from "../../components/ui/Button";

export default function ChurchSelectionScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper
      title="Church Affiliation"
      subtitle="Step 1 of 7"
      showBack={true}
      onBack={() => router.replace("/(auth)/login" as any)}
    >
      <ProgressBar currentStep={1} totalSteps={7} label="Step 1: Church" />

      <Text className="text-xl font-bold text-slate-900 mb-1">
        Select Your Church
      </Text>
      <Text className="text-sm text-slate-500 mb-6">
        Select your parent church or specific parish for pastoral oversight.
      </Text>

      <View className="rounded-2xl border border-dashed border-slate-300 p-8 items-center justify-center my-4">
        <Text className="text-slate-400 font-medium text-center">
          [Church Dropdown & Branch Input Shell]
        </Text>
      </View>

      <Button
        title="Continue to Location"
        onPress={() => router.push("/(onboarding)/location-profile" as any)}
        className="mt-6"
      />
    </ScreenWrapper>
  );
}
