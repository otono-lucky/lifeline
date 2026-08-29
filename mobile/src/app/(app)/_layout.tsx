// app/(app)/_layout.tsx
// Main Authenticated Application Stack Layout with Navigation Guard

import React from "react";
import { Stack } from "expo-router";
import { useNavGuard } from "../../hooks/useNavGuard";

export default function AppLayoutGroup() {
  useNavGuard("app");

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
