// app/(auth)/forgot-password.tsx
// Phase 3: Forgot Password Request Screen

import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import AuthLayout from "../../components/layout/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import authService from "../../services/authService";
import { Mail, ArrowLeft } from "lucide-react-native";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Email address is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      setIsSubmitted(true);
    } catch (err: any) {
      Alert.alert("Request Failed", err.message || "Failed to send reset email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      heroBadge="Account Recovery"
      heroTitle={["Reset Your", "Password."]}
      heroSubtitle="Enter your email to receive recovery instructions."
    >
      <View className="py-2">
        {isSubmitted ? (
          <View className="items-center py-4">
            <Text className="text-2xl font-bold text-slate-900 mb-2 text-center">
              Instructions Sent!
            </Text>
            <Text className="text-sm text-slate-500 text-center mb-6 leading-relaxed">
              If an account exists with <Text className="font-semibold text-slate-800">{email}</Text>, a reset link has been dispatched to your inbox.
            </Text>
            <Button
              title="Return to Sign In"
              variant="primary"
              onPress={() => router.replace("/(auth)/login" as any)}
              className="w-full"
            />
          </View>
        ) : (
          <View>
            <Text className="text-2xl font-bold text-slate-900 mb-1">
              Forgot Password
            </Text>
            <Text className="text-sm text-slate-500 mb-6">
              Enter the email address associated with your Lifeline profile.
            </Text>

            <Input
              label="Email Address"
              placeholder="your.email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={18} color="#64748B" />}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError("");
              }}
              error={error}
            />

            <Button
              title="Send Recovery Link"
              isLoading={isLoading}
              onPress={handleSubmit}
              className="mt-2 mb-4"
            />

            <Button
              title="Back to Sign In"
              variant="ghost"
              leftIcon={<ArrowLeft size={18} color="#64748B" />}
              onPress={() => router.back()}
            />
          </View>
        )}
      </View>
    </AuthLayout>
  );
}
