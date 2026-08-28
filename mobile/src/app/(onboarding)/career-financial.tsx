// app/(onboarding)/career-financial.tsx
// Step 3: Career & Financial Integrity (Salary Range + Privacy Firewall)

import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import ProgressBar from "../../components/ui/ProgressBar";
import Button from "../../components/ui/Button";

export default function CareerFinancialScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper
      title="Career & Finances"
      subtitle="Step 3 of 7"
      showBack={true}
    >
      <ProgressBar currentStep={3} totalSteps={7} label="Step 3: Finances" />

      <Text className="text-xl font-bold text-slate-900 mb-1">
        Professional & Financial Profile
      </Text>
      <Text className="text-sm text-slate-500 mb-6">
        Financial details are protected by the Privacy Firewall and visible only to your counselor.
      </Text>

      <View className="rounded-2xl border border-dashed border-slate-300 p-8 items-center justify-center my-4">
        <Text className="text-slate-400 font-medium text-center">
          [Occupation Input & Salary Range Dropdown Shell]
        </Text>
      </View>

      <Button
        title="Continue to Socials"
        onPress={() => router.push("/(onboarding)/social-identity" as any)}
        className="mt-6"
      />
    </ScreenWrapper>
  );
}
