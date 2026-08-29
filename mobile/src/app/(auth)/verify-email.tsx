// app/(auth)/verify-email.tsx
// Phase 3: Email Verification Screen

import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import AuthLayout from "../../components/layout/AuthLayout";
import Button from "../../components/ui/Button";
import authService from "../../services/authService";
import { MailCheck } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    if (!user?.email) {
      Alert.alert("Notice", "Please log in to resend verification email.");
      return;
    }

    setIsResending(true);
    try {
      await authService.resendVerification(user.email);
      Alert.alert("Success", "Verification email re-dispatched to your inbox.");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to resend verification email.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      heroBadge="Email Confirmation"
      heroTitle={["Verify Your", "Email."]}
      heroSubtitle="Confirm your email address to enable secure notifications."
    >
      <View className="py-4 items-center text-center">
        <View className="mb-6 rounded-full bg-blue-50 p-6 border border-blue-200">
          <MailCheck size={48} color="#2563EB" />
        </View>

        <Text className="text-2xl font-black text-slate-900 mb-2 text-center">
          Confirm Your Account
        </Text>

        <Text className="text-sm text-slate-500 text-center mb-6 leading-relaxed max-w-xs">
          A verification link has been sent to{" "}
          <Text className="font-semibold text-slate-800">{user?.email || "your inbox"}</Text>.
          Please check your inbox or spam folder.
        </Text>

        <Button
          title="Resend Verification Link"
          variant="outline"
          isLoading={isResending}
          onPress={handleResend}
          className="w-full mb-3"
        />

        <Button
          title="Return to Login"
          variant="secondary"
          onPress={() => router.replace("/(auth)/login" as any)}
          className="w-full"
        />
      </View>
    </AuthLayout>
  );
}
