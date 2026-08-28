// app/(auth)/verify-email.tsx

import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import AuthLayout from "../../components/layout/AuthLayout";
import Button from "../../components/ui/Button";

export default function VerifyEmailScreen() {
  const router = useRouter();

  return (
    <AuthLayout
      heroBadge="Email Confirmation"
      heroTitle={["Verify Your", "Email."]}
      heroSubtitle="Please check your inbox to confirm your email address."
    >
      <View className="py-2 items-center text-center">
        <Text className="text-2xl font-bold text-slate-900 mb-2">
          Check Your Inbox
        </Text>
        <Text className="text-sm text-slate-500 text-center mb-6">
          We've sent a verification link to your email. Please click the link to activate your account.
        </Text>

        <Button
          title="Return to Login"
          variant="primary"
          onPress={() => router.replace("/(auth)/login" as any)}
          className="w-full mt-4"
        />
      </View>
    </AuthLayout>
  );
}
