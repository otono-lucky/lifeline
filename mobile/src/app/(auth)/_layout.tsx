// app/(auth)/_layout.tsx
// Public Auth Stack Layout with declarative navigation guards

import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function AuthLayoutGroup() {
  const { isLoading, isAuthenticated, isProfileComplete, vettingStatus } = useAuth();

  if (!isLoading && isAuthenticated) {
    if (!isProfileComplete) {
      return <Redirect href="/(onboarding)/church-selection" />;
    }
    if (vettingStatus === "VETTED_ACTIVE") {
      return <Redirect href="/(app)/(tabs)/discovery" />;
    }
    return <Redirect href="/(vetting)/pending" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="lead-register" />
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-email" />
    </Stack>
  );
}
