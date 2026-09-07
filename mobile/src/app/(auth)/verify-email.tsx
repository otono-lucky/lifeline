// app/(auth)/verify-email.tsx
// Email Verification Screen — email is locked from route params, not editable by user

import React, { useState, useEffect } from "react";
import { View, Text, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AuthLayout from "../../components/layout/AuthLayout";
import Button from "../../components/ui/Button";
import authService from "../../services/authService";
import { MailCheck, ArrowRight, RefreshCw } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; autoSent?: string }>();
  const { user } = useAuth();

  // Email is READ-ONLY — sourced from route params (set by lead-register or login redirect)
  // Falls back to the authenticated user's email. Never editable by the user.
  const email = params.email || user?.email || "";

  const [countdown, setCountdown] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [autoSentBanner, setAutoSentBanner] = useState<boolean>(false);

  useEffect(() => {
    // When arriving from login auto-resend, show the info banner and reset countdown
    if (params.autoSent === "true") {
      setCountdown(60);
      setCanResend(false);
      setAutoSentBanner(true);
    }
  }, [params.autoSent]);

  // 60-second countdown timer (industry standard cooldown before resend is allowed)
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (countdown > 0) {
      setCanResend(false);
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResend = async () => {
    if (!email) {
      Alert.alert("Error", "No email address on file. Please go back and sign in again.");
      return;
    }

    setIsResending(true);
    try {
      await authService.resendVerification(email);
      Alert.alert(
        "Verification Link Sent",
        `A new verification link has been sent to ${email}. Please check your inbox or spam folder.`
      );
      setCountdown(60);
      setCanResend(false);
    } catch (err: any) {
      // Backend returns retryAfterSeconds on 429 rate-limit (now accessible since apiClient fix)
      const retryAfter = err?.response?.data?.errors?.retryAfterSeconds;
      if (retryAfter) {
        setCountdown(retryAfter);
        setCanResend(false);
      }
      Alert.alert("Error", err.message || "Failed to resend verification email.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      heroBadge="Email Confirmation"
      heroTitle={["Verify Your", "Email."]}
      heroSubtitle="Confirm your email address before signing in to access the platform."
    >
      <View className="py-4 items-center">
        <View className="mb-6 rounded-full bg-blue-50 p-6 border border-blue-200">
          <MailCheck size={48} color="#2563EB" />
        </View>

        <Text className="text-2xl font-black text-slate-900 mb-2 text-center">
          Check Your Inbox
        </Text>

        {/* Display locked email address — not editable */}
        <Text className="text-sm text-slate-500 text-center mb-6 leading-relaxed max-w-xs">
          We sent a verification link to:{"\n"}
          <Text className="font-bold text-slate-900">
            {email || "your registered email"}
          </Text>
          {"\n"}Click the link in the email to activate your account.
        </Text>

        {/* Info banner: shown when automatically redirected from login due to unverified email */}
        {autoSentBanner && (
          <View className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-4">
            <Text className="text-xs font-semibold text-amber-800 leading-relaxed">
              A fresh verification link was automatically sent to your inbox because your email wasn't verified yet.
            </Text>
          </View>
        )}

        {/* Resend button with countdown — enabled after 60s */}
        <Button
          title={
            canResend
              ? "Resend Verification Link"
              : `Resend available in ${countdown}s`
          }
          variant="outline"
          disabled={!canResend || isResending}
          isLoading={isResending}
          leftIcon={<RefreshCw size={16} color={canResend ? "#2563EB" : "#94A3B8"} />}
          onPress={handleResend}
          className="w-full mb-3"
        />

        {/* CTA: once the user has clicked the link in their inbox, they tap this to go sign in */}
        <Button
          title="I've Verified My Email — Sign In"
          rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
          onPress={() => router.replace("/(auth)/login" as any)}
          className="w-full mb-4"
        />

        <Text className="text-xs text-slate-400 text-center">
          Didn't receive anything? Check your spam/junk folder.
        </Text>
      </View>
    </AuthLayout>
  );
}
