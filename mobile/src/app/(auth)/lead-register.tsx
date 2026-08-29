// app/(auth)/lead-register.tsx
// Phase 3: Step 1 Low-Friction Lead Registration with React Hook Form + Zod

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
import { Mail, Phone, Lock, User, ArrowRight } from "lucide-react-native";

const leadRegisterSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().min(1, "Email address is required").email("Please enter a valid email address"),
    phone: z.string().min(6, "Valid phone number is required"),
    gender: z.enum(["Male", "Female"]),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type LeadRegisterFormValues = z.infer<typeof leadRegisterSchema>;

export default function LeadRegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LeadRegisterFormValues>({
    resolver: zodResolver(leadRegisterSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "Male",
      password: "",
      confirmPassword: "",
    },
  });

  const currentGender = watch("gender");

  const onSubmit = async (values: LeadRegisterFormValues) => {
    setIsLoading(true);
    try {
      const response = await authService.registerLead({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim(),
        gender: values.gender,
        password: values.password,
      });

      if (response.success && response.data.token) {
        await login(response.data.token, response.data.user);
        router.replace("/(onboarding)/church-selection" as any);
      }
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message || "An error occurred during registration.");
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
        gender: currentGender,
      });

      if (response.success && response.data.token) {
        await login(response.data.token, response.data.user);
        router.replace("/(onboarding)/church-selection" as any);
      }
    } catch (error: any) {
      Alert.alert("Social Sign-In Failed", error.message || "Failed to authenticate.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      heroBadge="Faith-Based Matchmaking"
      heroTitle={["Create Your", "Account."]}
      heroSubtitle="Step 1: Connect with intentional, verified believers for marriage."
    >
      {/* Gender Selection */}
      <View className="mb-4">
        <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          I am a:
        </Text>
        <View className="flex-row gap-3">
          {(["Male", "Female"] as const).map((g) => {
            const isSelected = currentGender === g;
            return (
              <TouchableOpacity
                key={g}
                onPress={() => setValue("gender", g)}
                activeOpacity={0.8}
                className={`flex-1 flex-row items-center justify-center p-3.5 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <Text
                  className={`text-sm font-bold ${
                    isSelected ? "text-blue-600" : "text-slate-700"
                  }`}
                >
                  {g === "Male" ? "Brother (Male)" : "Sister (Female)"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Name Fields */}
      <View className="flex-row gap-3 mb-1">
        <View className="flex-1">
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="First Name"
                placeholder="John"
                leftIcon={<User size={18} color="#64748B" />}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.firstName?.message}
              />
            )}
          />
        </View>
        <View className="flex-1">
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Last Name"
                placeholder="Doe"
                leftIcon={<User size={18} color="#64748B" />}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.lastName?.message}
              />
            )}
          />
        </View>
      </View>

      {/* Email */}
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Email Address"
            placeholder="john.doe@example.com"
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

      {/* Phone */}
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Phone Number"
            placeholder="+1 555-0199"
            keyboardType="phone-pad"
            leftIcon={<Phone size={18} color="#64748B" />}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.phone?.message}
          />
        )}
      />

      {/* Passwords */}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Password"
            placeholder="••••••••"
            secureTextEntry
            leftIcon={<Lock size={18} color="#64748B" />}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.password?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Confirm Password"
            placeholder="••••••••"
            secureTextEntry
            leftIcon={<Lock size={18} color="#64748B" />}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.confirmPassword?.message}
          />
        )}
      />

      {/* Submit Button */}
      <Button
        title="Continue to Onboarding"
        isLoading={isLoading}
        rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
        onPress={handleSubmit(onSubmit)}
        className="mt-2 mb-4"
      />

      {/* Social Options */}
      <View className="flex-row items-center my-4">
        <View className="flex-1 h-[1px] bg-slate-200" />
        <Text className="mx-4 text-xs font-semibold text-slate-400 uppercase">
          Or Continue With
        </Text>
        <View className="flex-1 h-[1px] bg-slate-200" />
      </View>

      <View className="flex-row gap-3 mb-6">
        <Button
          title="Google"
          variant="secondary"
          size="sm"
          onPress={() => handleSocialMock("GOOGLE")}
          className="flex-1"
        />
        <Button
          title="Apple"
          variant="secondary"
          size="sm"
          onPress={() => handleSocialMock("APPLE")}
          className="flex-1"
        />
      </View>

      {/* Existing Member Link */}
      <View className="flex-row items-center justify-center">
        <Text className="text-sm text-slate-600">Already registered? </Text>
        <TouchableOpacity
          onPress={() => router.push("/(auth)/login" as any)}
          activeOpacity={0.7}
        >
          <Text className="text-sm font-bold text-blue-600">Sign In</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
}
