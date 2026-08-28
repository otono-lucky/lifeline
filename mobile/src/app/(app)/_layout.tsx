// app/(app)/_layout.tsx
// Main Authenticated Application Stack Layout

import React from "react";
import { Stack } from "expo-router";

export default function AppLayoutGroup() {
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
