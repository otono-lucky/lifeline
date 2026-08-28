// app/(onboarding)/preferences.tsx
// Step 6: Match Scope & Denominational Preferences

import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import ProgressBar from "../../components/ui/ProgressBar";
import Button from "../../components/ui/Button";

export default function PreferencesScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper
      title="Match Preferences"
      subtitle="Step 6 of 7"
      showBack={true}
    >
      <ProgressBar currentStep={6} totalSteps={7} label="Step 6: Preferences" />

      <Text className="text-xl font-bold text-slate-900 mb-1">
        Match Scope
      </Text>
      <Text className="text-sm text-slate-500 mb-6">
        Select whether you want to match within your church only, other churches, or both.
      </Text>

      <View className="rounded-2xl border border-dashed border-slate-300 p-8 items-center justify-center my-4">
        <Text className="text-slate-400 font-medium text-center">
          [Match Scope Radio Selectors Shell]
        </Text>
      </View>

      <Button
        title="Review & Complete Profile"
        onPress={() => router.push("/(onboarding)/completion-review" as any)}
        className="mt-6"
      />
    </ScreenWrapper>
  );
}
