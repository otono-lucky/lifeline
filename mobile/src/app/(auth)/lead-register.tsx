// app/(auth)/lead-register.tsx
// Step 1: Low-Friction Lead Registration (Captures initial contact & initiates retention loop)

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import AuthLayout from "../../components/layout/AuthLayout";
import Button from "../../components/ui/Button";

export default function LeadRegisterScreen() {
  const router = useRouter();

  return (
    <AuthLayout
      heroBadge="Step 1 of 2 — Quick Start"
      heroTitle={["Where Faith", "Meets Logic."]}
      heroSubtitle="Create your preliminary profile to explore verified Christian believers."
    >
      <View className="py-2">
        <Text className="text-2xl font-bold text-slate-900 mb-1">
          Begin Your Journey
        </Text>
        <Text className="text-sm text-slate-500 mb-6">
          Enter your basic details to start. You can complete your full profile anytime.
        </Text>

        <View className="rounded-2xl border border-dashed border-slate-300 p-6 items-center justify-center my-4">
          <Text className="text-slate-400 font-medium text-center">
            [Lead Registration Form Shell]
          </Text>
        </View>

        <Button
          title="Continue to Login"
          variant="secondary"
          onPress={() => router.push("/(auth)/login" as any)}
          className="mt-4"
        />

        <View className="mt-6 flex-row items-center justify-center">
          <Text className="text-sm text-slate-500">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login" as any)}>
            <Text className="text-sm font-bold text-blue-600">Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AuthLayout>
  );
}
