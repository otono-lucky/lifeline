// app/(auth)/forgot-password.tsx

import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import AuthLayout from "../../components/layout/AuthLayout";
import Button from "../../components/ui/Button";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  return (
    <AuthLayout
      heroBadge="Account Recovery"
      heroTitle={["Reset Your", "Password."]}
      heroSubtitle="We'll send a secure reset link to your registered email address."
    >
      <View className="py-2">
        <Text className="text-2xl font-bold text-slate-900 mb-1">
          Forgot Password
        </Text>
        <Text className="text-sm text-slate-500 mb-6">
          Enter your email address to receive password reset instructions.
        </Text>

        <View className="rounded-2xl border border-dashed border-slate-300 p-6 items-center justify-center my-4">
          <Text className="text-slate-400 font-medium text-center">
            [Forgot Password Input & Submit Shell]
          </Text>
        </View>

        <Button
          title="Back to Sign In"
          variant="secondary"
          onPress={() => router.back()}
          className="mt-4"
        />
      </View>
    </AuthLayout>
  );
}
