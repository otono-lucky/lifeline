// app/(auth)/lead-register.tsx
// Phase 3: Step 1 Low-Friction Lead Registration & Retention Loop

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AuthLayout from "../../components/layout/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import authService from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { Mail, Phone, Lock, User, ArrowRight } from "lucide-react-native";

export default function LeadRegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "Male",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await authService.registerLead({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        password: formData.password,
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
        gender: formData.gender,
      });

      if (response.success && response.data.token) {
        await login(response.data.token, response.data.user);
        router.replace("/(onboarding)/church-selection" as any);
      }
    } catch (error: any) {
      Alert.alert("Social Sign-In", error.message || "Social sign in failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      heroBadge="Step 1 of 2 — Quick Start"
      heroTitle={["Where Faith", "Meets Logic."]}
      heroSubtitle="Create your preliminary account. You can complete your full profile in the next step."
    >
      <View className="py-1">
        <Text className="text-2xl font-black text-slate-900 mb-1">
          Begin Your Journey
        </Text>
        <Text className="text-sm text-slate-500 mb-5">
          Join verified Christian believers preparing for marriage.
        </Text>

        {/* Gender Selector Toggle */}
        <Text className="text-sm font-medium text-slate-700 mb-2">I am a</Text>
        <View className="flex-row gap-3 mb-4">
          <TouchableOpacity
            onPress={() => setFormData({ ...formData, gender: "Male" })}
            className={`flex-1 flex-row items-center justify-center rounded-2xl py-3.5 border ${
              formData.gender === "Male"
                ? "bg-blue-50 border-blue-600 shadow-sm"
                : "bg-white border-slate-200"
            }`}
          >
            <Text
              className={`text-sm font-bold ${
                formData.gender === "Male" ? "text-blue-600" : "text-slate-700"
              }`}
            >
              Christian Brother (Male)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFormData({ ...formData, gender: "Female" })}
            className={`flex-1 flex-row items-center justify-center rounded-2xl py-3.5 border ${
              formData.gender === "Female"
                ? "bg-blue-50 border-blue-600 shadow-sm"
                : "bg-white border-slate-200"
            }`}
          >
            <Text
              className={`text-sm font-bold ${
                formData.gender === "Female" ? "text-blue-600" : "text-slate-700"
              }`}
            >
              Christian Sister (Female)
            </Text>
          </TouchableOpacity>
        </View>

        {/* First & Last Name */}
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              label="First Name"
              placeholder="e.g. John"
              leftIcon={<User size={18} color="#64748B" />}
              value={formData.firstName}
              onChangeText={(text) => setFormData({ ...formData, firstName: text })}
              error={errors.firstName}
            />
          </View>
          <View className="flex-1">
            <Input
              label="Last Name"
              placeholder="e.g. Doe"
              value={formData.lastName}
              onChangeText={(text) => setFormData({ ...formData, lastName: text })}
              error={errors.lastName}
            />
          </View>
        </View>

        {/* Email */}
        <Input
          label="Email Address"
          placeholder="your.email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={<Mail size={18} color="#64748B" />}
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          error={errors.email}
        />

        {/* Phone */}
        <Input
          label="Phone Number"
          placeholder="+234 800 000 0000"
          keyboardType="phone-pad"
          leftIcon={<Phone size={18} color="#64748B" />}
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          error={errors.phone}
        />

        {/* Password */}
        <Input
          label="Password"
          placeholder="At least 6 characters"
          isPassword
          leftIcon={<Lock size={18} color="#64748B" />}
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          error={errors.password}
        />

        {/* Confirm Password */}
        <Input
          label="Confirm Password"
          placeholder="Re-enter password"
          isPassword
          leftIcon={<Lock size={18} color="#64748B" />}
          value={formData.confirmPassword}
          onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
          error={errors.confirmPassword}
        />

        {/* Submit Button */}
        <Button
          title="Continue to Profile Enrichment"
          rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
          isLoading={isLoading}
          onPress={handleRegister}
          className="mt-3 mb-4"
        />

        {/* Divider */}
        <View className="flex-row items-center my-4">
          <View className="flex-1 h-[1px] bg-slate-200" />
          <Text className="mx-4 text-xs font-bold uppercase tracking-wider text-slate-400">
            Or Quick Start With
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

        {/* Sign In Link */}
        <View className="flex-row items-center justify-center pb-4">
          <Text className="text-sm text-slate-500">Already registered? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login" as any)}>
            <Text className="text-sm font-bold text-blue-600">Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AuthLayout>
  );
}
