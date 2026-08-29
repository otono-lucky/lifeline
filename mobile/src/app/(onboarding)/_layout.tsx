// app/(onboarding)/_layout.tsx
// Profile Enrichment Wizard Stack Layout with declarative navigation guards

import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function OnboardingLayoutGroup() {
  const { isLoading, isAuthenticated, isProfileComplete, vettingStatus } = useAuth();

  if (!isLoading) {
    if (!isAuthenticated) {
      return <Redirect href="/(auth)/lead-register" />;
    }
    if (isProfileComplete) {
      if (vettingStatus === "VETTED_ACTIVE") {
        return <Redirect href="/(app)/(tabs)/discovery" />;
      }
      return <Redirect href="/(vetting)/pending" />;
    }
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="church-selection" />
      <Stack.Screen name="location-profile" />
      <Stack.Screen name="career-financial" />
      <Stack.Screen name="social-identity" />
      <Stack.Screen name="media-upload" />
      <Stack.Screen name="preferences" />
      <Stack.Screen name="completion-review" />
    </Stack>
  );
}
