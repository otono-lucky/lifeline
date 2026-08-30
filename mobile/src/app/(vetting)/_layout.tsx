// app/(vetting)/_layout.tsx
// Vetting Gatekeeper Stack Layout with declarative navigation guards

import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function VettingLayoutGroup() {
  const { isLoading, isAuthenticated, isProfileComplete, vettingStatus } = useAuth();

  if (!isLoading) {
    if (!isAuthenticated) {
      return <Redirect href="/(auth)/lead-register" />;
    }
    if (!isProfileComplete) {
      return <Redirect href="/(onboarding)/church-selection" />;
    }
    if (vettingStatus === "VETTED_ACTIVE") {
      return <Redirect href="/(app)/(tabs)/discovery" />;
    }
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="pending" />
      <Stack.Screen name="rejected" />
      <Stack.Screen name="blocked" />
      <Stack.Screen name="debrief" />
    </Stack>
  );
}
