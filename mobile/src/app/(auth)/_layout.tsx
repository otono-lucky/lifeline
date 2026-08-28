// app/(auth)/_layout.tsx
// Public Auth Stack Layout

import React from "react";
import { Stack } from "expo-router";

export default function AuthLayoutGroup() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="lead-register" />
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-email" />
    </Stack>
  );
}
