// app/(onboarding)/completion-review.tsx
// Step 7: 100% Score Review & Submit for Counselor Vetting

import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import ProgressBar from "../../components/ui/ProgressBar";
import Button from "../../components/ui/Button";

export default function CompletionReviewScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper
      title="Profile Review"
      subtitle="Final Step"
      showBack={true}
    >
      <ProgressBar currentStep={7} totalSteps={7} label="Final Verification" />

      <Text className="text-2xl font-bold text-slate-900 mb-1">
        Ready for Counselor Vetting
      </Text>
      <Text className="text-sm text-slate-500 mb-6">
        Review your information to verify that you've achieved 100% completion before submitting.
      </Text>

      <View className="rounded-2xl border border-dashed border-slate-300 p-8 items-center justify-center my-4">
        <Text className="text-slate-400 font-medium text-center">
          [100% Completeness Score Breakdown & Submit Shell]
        </Text>
      </View>

      <Button
        title="Submit Profile for Vetting"
        onPress={() => router.replace("/(vetting)/pending" as any)}
        className="mt-6"
      />
    </ScreenWrapper>
  );
}
