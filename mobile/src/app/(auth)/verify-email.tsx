// app/(auth)/verify-email.tsx
// Phase 3: Email Verification Screen with 60s Countdown Timer & Resend

import React, { useState, useEffect } from "react";
import { View, Text, Alert, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AuthLayout from "../../components/layout/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import authService from "../../services/authService";
import { MailCheck, Mail, ArrowRight, RefreshCw } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; autoSent?: string }>();
  const { user } = useAuth();

  const [email, setEmail] = useState<string>(params.email || user?.email || "");
  const [countdown, setCountdown] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [autoSentBanner, setAutoSentBanner] = useState<boolean>(false);

  useEffect(() => {
    if (params.email) {
      setEmail(params.email);
    }
    // When arriving from login auto-resend, reset the countdown
    if (params.autoSent === "true") {
      setCountdown(60);
      setCanResend(false);
      setAutoSentBanner(true);
    }
  }, [params.email, params.autoSent]);

  // 60-second industry standard countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
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
    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail) {
      Alert.alert("Required", "Please provide your registered email address.");
      return;
    }

    setIsResending(true);
    try {
      await authService.resendVerification(targetEmail);
      Alert.alert(
        "Verification Link Sent",
        `We've sent a new verification link to ${targetEmail}. Please check your inbox or spam folder.`
      );
      setCountdown(60);
      setCanResend(false);
    } catch (err: any) {
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

        <Text className="text-sm text-slate-500 text-center mb-6 leading-relaxed max-w-xs">
          We sent a verification link to:{"\n"}
          <Text className="font-bold text-slate-900">
            {email || "your registered email"}
          </Text>
          {"\n"}Click the link in the email to activate your account.
        </Text>

        {/* Banner shown when automatically redirected from login */}
        {autoSentBanner && (
          <View className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-4 flex-row items-start gap-2">
            <Text className="text-xs font-semibold text-amber-800 flex-1 leading-relaxed">
              A fresh verification link was automatically sent to your inbox because your email wasn't verified yet.
            </Text>
          </View>
        )}

        {!params.email && !user?.email && (
          <View className="w-full mb-4">
            <Input
              label="Registered Email Address"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={18} color="#64748B" />}
              value={email}
              onChangeText={setEmail}
            />
          </View>
        )}

        {/* Resend Action with Countdown */}
        <Button
          title={
            canResend
              ? "Resend Verification Link"
              : `Resend Link in ${countdown}s`
          }
          variant="outline"
          disabled={!canResend || isResending}
          isLoading={isResending}
          leftIcon={<RefreshCw size={16} color={canResend ? "#2563EB" : "#94A3B8"} />}
          onPress={handleResend}
          className="w-full mb-3"
        />

        {/* Continue to Login Button */}
        <Button
          title="I've Verified My Email — Sign In"
          rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
          onPress={() => router.replace("/(auth)/login" as any)}
          className="w-full mb-4"
        />

        <View className="flex-row items-center justify-center">
          <Text className="text-xs text-slate-400">
            Didn't receive anything? Check your spam/junk folder.
          </Text>
        </View>
      </View>
    </AuthLayout>
  );
}
