// app/(vetting)/_layout.tsx
// Vetting Gatekeeper Stack Layout with Navigation Guard

import React from "react";
import { Stack } from "expo-router";
import { useNavGuard } from "../../hooks/useNavGuard";

export default function VettingLayoutGroup() {
  useNavGuard("vetting");

  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="pending" />
      <Stack.Screen name="rejected" />
      <Stack.Screen name="blocked" />
      <Stack.Screen name="debrief" />
    </Stack>
  );
}
