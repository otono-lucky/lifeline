// app/(onboarding)/_layout.tsx
// Profile Enrichment Wizard Stack Layout with Navigation Guard

import React from "react";
import { Stack } from "expo-router";
import { useNavGuard } from "../../hooks/useNavGuard";

export default function OnboardingLayoutGroup() {
  useNavGuard("onboarding");

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
