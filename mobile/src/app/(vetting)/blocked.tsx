// app/(vetting)/blocked.tsx
// Account Blocked - Appeals Workflow for System Administrator Review

import React from "react";
import { View, Text } from "react-native";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { ShieldAlert } from "lucide-react-native";

export default function BlockedVettingScreen() {
  return (
    <ScreenWrapper
      title="Account Restricted"
      isScrollable={false}
    >
      <View className="flex-1 items-center justify-center py-6">
        <View className="mb-6 rounded-full bg-red-500/10 p-6 border-2 border-red-200">
          <ShieldAlert size={48} color="#DC2626" />
        </View>

        <Text className="text-2xl font-bold text-slate-900 text-center mb-2">
          Account Status Restricted
        </Text>
        <Text className="text-base text-slate-500 text-center mb-6 max-w-xs leading-relaxed">
          Your account has been restricted following counselor review. If you believe this is in error, you may submit an appeal.
        </Text>

        <Card className="w-full mb-6">
          <Text className="text-sm font-bold text-slate-800 mb-2">
            Submit Appeal:
          </Text>
          <Text className="text-xs text-slate-500 mb-4">
            Explain the circumstances to platform administrators for reconsideration.
          </Text>
        </Card>

        <Button
          title="Submit Appeal to SuperAdmin"
          variant="danger"
          onPress={() => {}}
          className="w-full"
        />
      </View>
    </ScreenWrapper>
  );
}
