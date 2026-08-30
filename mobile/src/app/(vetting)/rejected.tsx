// app/(vetting)/rejected.tsx
// Phase 5: Rejected / Profile Revision Required Screen

import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";
import { AlertCircle, Edit3, MessageSquare } from "lucide-react-native";

export default function RejectedVettingScreen() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <ScreenWrapper
      title="Profile Revision Required"
      isScrollable={true}
    >
      <View className="py-4 items-center">
        <View className="mb-6 rounded-full bg-amber-500/10 p-7 border-2 border-amber-400/30">
          <AlertCircle size={52} color="#D97706" />
        </View>

        <Badge label="Status: Corrections Requested" variant="warning" className="mb-3" />

        <Text className="text-2xl font-black text-slate-900 text-center mb-2">
          Feedback From Your Counselor
        </Text>
        <Text className="text-sm text-slate-500 text-center mb-6 max-w-xs leading-relaxed">
          Your pastoral counselor reviewed your submission and requested adjustments before approving discovery access.
        </Text>

        {/* Reason Logged Card */}
        <Card className="w-full mb-6 bg-amber-50/50 border border-amber-200">
          <View className="flex-row items-center mb-2">
            <MessageSquare size={18} color="#D97706" />
            <Text className="ml-2 text-xs font-bold uppercase tracking-wider text-amber-800">
              Counselor Notes:
            </Text>
          </View>
          <Text className="text-sm font-medium text-slate-800 leading-relaxed">
            {user?.verificationNotes ||
              "Please update your profile photos with higher quality individual pictures and verify your specific parish branch."}
          </Text>
        </Card>

        {/* Action Button to Step Wizard */}
        <Button
          title="Update & Correct Profile"
          leftIcon={<Edit3 size={18} color="#FFFFFF" />}
          onPress={() => router.replace("/(onboarding)/church-selection" as any)}
          className="w-full mb-3"
        />
      </View>
    </ScreenWrapper>
  );
}
