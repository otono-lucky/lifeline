// app/(auth)/login.tsx
// User & Credentials Login Screen

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import AuthLayout from "../../components/layout/AuthLayout";
import Button from "../../components/ui/Button";

export default function LoginScreen() {
  const router = useRouter();

  return (
    <AuthLayout
      heroBadge="Secure Sign In"
      heroTitle={["Welcome", "Back."]}
      heroSubtitle="Log in to access your prospective matches and counselor conversations."
    >
      <View className="py-2">
        <Text className="text-2xl font-bold text-slate-900 mb-1">Sign In</Text>
        <Text className="text-sm text-slate-500 mb-6">
          Enter your registered email and password.
        </Text>

        <View className="rounded-2xl border border-dashed border-slate-300 p-6 items-center justify-center my-4">
          <Text className="text-slate-400 font-medium text-center">
            [Login Form & Social Auth Buttons Shell]
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/forgot-password" as any)}
          className="self-end mb-4"
        >
          <Text className="text-sm font-semibold text-blue-600">
            Forgot Password?
          </Text>
        </TouchableOpacity>

        <Button
          title="Create New Account"
          variant="secondary"
          onPress={() => router.push("/(auth)/lead-register" as any)}
        />
      </View>
    </AuthLayout>
  );
}
