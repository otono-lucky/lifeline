// app/(vetting)/pending.tsx
// Profile Submitted - Awaiting Pastoral / Counselor Interview

import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Clock } from "lucide-react-native";

export default function PendingVettingScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper
      title="Verification Status"
      headerBackground="indigo"
      isScrollable={false}
    >
      <View className="flex-1 items-center justify-center py-6">
        <View className="mb-6 rounded-full bg-blue-500/10 p-6 border-2 border-blue-200">
          <Clock size={48} color="#2563EB" />
        </View>

        <Text className="text-2xl font-bold text-slate-900 text-center mb-2">
          Awaiting Counselor Review
        </Text>
        <Text className="text-base text-slate-500 text-center mb-8 max-w-xs leading-relaxed">
          Your profile has reached 100% completion. Your assigned counselor will contact you for a brief video or voice interview.
        </Text>

        <Card className="w-full mb-6">
          <Text className="text-sm font-bold text-slate-800 mb-2">Next Steps:</Text>
          <Text className="text-xs text-slate-600 mb-1.5">• Verify your WhatsApp number is active</Text>
          <Text className="text-xs text-slate-600 mb-1.5">• Prepare your church membership confirmation</Text>
          <Text className="text-xs text-slate-600">• Keep notifications enabled for appointment updates</Text>
        </Card>

        <Button
          title="Refresh Status"
          onPress={() => router.replace("/" as any)}
          className="w-full"
        />
      </View>
    </ScreenWrapper>
  );
}
