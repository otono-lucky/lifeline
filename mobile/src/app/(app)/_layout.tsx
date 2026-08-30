// app/(app)/_layout.tsx
// Main Authenticated Application Stack Layout with declarative navigation guards

import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function AppLayoutGroup() {
  const { isLoading, isAuthenticated, isProfileComplete, vettingStatus } = useAuth();

  if (!isLoading) {
    if (!isAuthenticated) {
      return <Redirect href="/(auth)/lead-register" />;
    }
    if (!isProfileComplete) {
      return <Redirect href="/(onboarding)/church-selection" />;
    }
    if (vettingStatus !== "VETTED_ACTIVE") {
      switch (vettingStatus) {
        case "PENDING_VETTING":
          return <Redirect href="/(vetting)/pending" />;
        case "REJECTED":
          return <Redirect href="/(vetting)/rejected" />;
        case "HARD_BLOCKED":
          return <Redirect href="/(vetting)/blocked" />;
        case "DEBRIEF_REQUIRED":
          return <Redirect href="/(vetting)/debrief" />;
        default:
          return <Redirect href="/(vetting)/pending" />;
      }
    }
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="chat/[conversationId]" />
      <Stack.Screen
        name="candidate/[userId]"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="modal/event-scheduler"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="modal/subscription-tier"
        options={{ presentation: "modal" }}
      />
    </Stack>
  );
}
