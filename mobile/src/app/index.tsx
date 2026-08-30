// app/index.tsx
// Central Navigation Guard & Gatekeeper State Machine (§3–4)

import React, { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function IndexDispatcher() {
  const router = useRouter();
  const { isLoading, isAuthenticated, isProfileComplete, vettingStatus } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // 1. Unauthenticated -> Send to Step 1 Lead Registration / Login
      router.replace("/(auth)/lead-register" as any);
      return;
    }

    // 2. Authenticated -> Check 100% Profile Completion Gate
    if (!isProfileComplete) {
      router.replace("/(onboarding)/church-selection" as any);
      return;
    }

    // 3. 100% Complete -> Evaluate Vetting State Machine
    switch (vettingStatus) {
      case "PENDING_VETTING":
        router.replace("/(vetting)/pending" as any);
        break;
      case "REJECTED":
        router.replace("/(vetting)/rejected" as any);
        break;
      case "HARD_BLOCKED":
        router.replace("/(vetting)/blocked" as any);
        break;
      case "DEBRIEF_REQUIRED":
        router.replace("/(vetting)/debrief" as any);
        break;
      case "VETTED_ACTIVE":
      default:
        router.replace("/(app)/(tabs)/discovery" as any);
        break;
    }
  }, [isLoading, isAuthenticated, isProfileComplete, vettingStatus]);

  return (
    <View className="flex-1 items-center justify-center bg-indigo-950 px-6">
      <ActivityIndicator size="large" color="#93C5FD" />
      <Text className="mt-4 text-center text-sm font-semibold text-indigo-200">
        Loading Lifeline...
      </Text>
    </View>
  );
}
