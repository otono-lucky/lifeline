// app/(vetting)/_layout.tsx
// Vetting Gatekeeper Stack Layout

import React from "react";
import { Stack } from "expo-router";

export default function VettingLayoutGroup() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="pending" />
      <Stack.Screen name="rejected" />
      <Stack.Screen name="blocked" />
      <Stack.Screen name="debrief" />
    </Stack>
  );
}
