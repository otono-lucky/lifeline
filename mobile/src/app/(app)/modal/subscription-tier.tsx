// app/(app)/modal/subscription-tier.tsx
// Periodic Subscription Selector Modal (Monthly vs Yearly)

import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";
import Button from "../../../components/ui/Button";

export default function SubscriptionTierModal() {
  const router = useRouter();

  return (
    <ScreenWrapper
      title="Lifeline Premium"
      subtitle="Uninterrupted access to discovery and counselor oversight"
      showBack={true}
      onBack={() => router.back()}
    >
      <View className="rounded-3xl border border-dashed border-slate-300 p-12 items-center justify-center my-6">
        <Text className="text-slate-400 font-medium text-center">
          [Monthly vs. Yearly Plan Selection Shell]
        </Text>
      </View>

      <Button
        title="Subscribe Now"
        onPress={() => router.back()}
        className="mt-4"
      />
    </ScreenWrapper>
  );
}
