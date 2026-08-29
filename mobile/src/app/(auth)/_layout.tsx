// app/(auth)/_layout.tsx
// Public Auth Stack Layout with Navigation Guard

import React from "react";
import { Stack } from "expo-router";
import { useNavGuard } from "../../hooks/useNavGuard";

export default function AuthLayoutGroup() {
  useNavGuard("auth");

  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="lead-register" />
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-email" />
    </Stack>
  );
}
