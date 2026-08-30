// app/(auth)/login.tsx
// Phase 3: Login Screen with React Hook Form + Zod

import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AuthLayout from "../../components/layout/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import authService from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { Mail, Lock, LogIn } from "lucide-react-native";

const loginSchema = z.object({
  email: z.string().min(1, "Email address is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await authService.login({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      if (response.success && response.data.token) {
        await login(response.data.token, response.data.user);
        router.replace("/" as any);
      }
    } catch (error: any) {
      Alert.alert("Sign In Failed", error.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialMock = async (provider: "GOOGLE" | "APPLE") => {
    setIsLoading(true);
    try {
      const response = await authService.socialLogin({
        email: `member_${Date.now()}@example.com`,
        authProvider: provider,
        authProviderId: `auth_${Date.now()}`,
        firstName: "Faith",
        lastName: "Believer",
      });

      if (response.success && response.data.token) {
        await login(response.data.token, response.data.user);
        router.replace("/" as any);
      }
    } catch (error: any) {
      Alert.alert("Social Sign-In", error.message || "Social sign in failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      heroBadge="Covenant Community"
      heroTitle={["Welcome", "Back."]}
      heroSubtitle="Log in to access your prospective matches and counselor conversations."
    >
      <View className="py-2">
        <Text className="text-2xl font-black text-slate-900 mb-1">Sign In</Text>
        <Text className="text-sm text-slate-500 mb-6">
          Enter your registered email and password.
        </Text>

        {/* Email */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email Address"
              placeholder="your.email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={18} color="#64748B" />}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.email?.message}
            />
          )}
        />

        {/* Password */}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Password"
              placeholder="Enter your password"
              isPassword
              leftIcon={<Lock size={18} color="#64748B" />}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.password?.message}
            />
          )}
        />

        {/* Forgot Password Link */}
        <TouchableOpacity
          onPress={() => router.push("/(auth)/forgot-password" as any)}
          className="self-end mb-6"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-sm font-semibold text-blue-600">
            Forgot Password?
          </Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <Button
          title="Sign In"
          rightIcon={<LogIn size={18} color="#FFFFFF" />}
          isLoading={isLoading}
          onPress={handleSubmit(onSubmit)}
          className="mb-4"
        />

        {/* Divider */}
        <View className="flex-row items-center my-4">
          <View className="flex-1 h-[1px] bg-slate-200" />
          <Text className="mx-4 text-xs font-bold uppercase tracking-wider text-slate-400">
            Or Continue With
          </Text>
          <View className="flex-1 h-[1px] bg-slate-200" />
        </View>

        {/* Social Auth Buttons */}
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity
            onPress={() => handleSocialMock("GOOGLE")}
            className="flex-1 flex-row items-center justify-center rounded-2xl border border-slate-200 bg-white py-3.5 active:bg-slate-100 shadow-sm"
          >
            <Text className="text-sm font-bold text-slate-800">Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSocialMock("APPLE")}
            className="flex-1 flex-row items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 py-3.5 active:bg-slate-800 shadow-sm"
          >
            <Text className="text-sm font-bold text-white">Apple</Text>
          </TouchableOpacity>
        </View>

        {/* Register Link */}
        <View className="flex-row items-center justify-center pb-4">
          <Text className="text-sm text-slate-500">Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/lead-register" as any)}>
            <Text className="text-sm font-bold text-blue-600">Start Here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AuthLayout>
  );
}
