// app/(vetting)/rejected.tsx
// Profile Revision Required (Counselor feedback logged)

import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { AlertCircle } from "lucide-react-native";

export default function RejectedVettingScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper
      title="Profile Revision Required"
      isScrollable={false}
    >
      <View className="flex-1 items-center justify-center py-6">
        <View className="mb-6 rounded-full bg-amber-500/10 p-6 border-2 border-amber-200">
          <AlertCircle size={48} color="#D97706" />
        </View>

        <Text className="text-2xl font-bold text-slate-900 text-center mb-2">
          Feedback From Counselor
        </Text>
        <Text className="text-base text-slate-500 text-center mb-6 max-w-xs">
          Your counselor reviewed your submission and requested adjustments.
        </Text>

        <Card className="w-full mb-6 bg-amber-50/40 border border-amber-200">
          <Text className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
            Reason Logged:
          </Text>
          <Text className="text-sm font-medium text-slate-800">
            "Please upload higher quality photos and provide your specific parish branch."
          </Text>
        </Card>

        <Button
          title="Update Profile Details"
          onPress={() => router.push("/(onboarding)/church-selection" as any)}
          className="w-full"
        />
      </View>
    </ScreenWrapper>
  );
}
