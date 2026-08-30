// components/layout/AuthLayout.tsx
// Visual Reference Mirror: Web Auth Banner with Deep Indigo Hero and Pill Badge

import React from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AuthLayoutProps {
  children: React.ReactNode;
  heroBadge?: string;
  heroTitle?: [string, string];
  heroSubtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  heroBadge = "Faith-Based Matchmaking",
  heroTitle = ["Where Faith", "Meets Logic."],
  heroSubtitle = "A covenant-focused, moderated community designed for marriage-minded believers.",
}) => {
  return (
    <SafeAreaView className="flex-1 bg-indigo-950" edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Branding Panel (Web Mirror) */}
          <View className="px-6 pt-6 pb-8 bg-indigo-950">
            {/* Pill Hero Badge */}
            <View className="mb-4 self-start rounded-full bg-blue-500/20 px-3.5 py-1.5 border border-blue-400/30">
              <Text className="text-xs font-bold uppercase tracking-widest text-blue-200">
                {heroBadge}
              </Text>
            </View>

            {/* Hero Header Title */}
            <Text className="text-3xl font-black text-white leading-tight">
              {heroTitle[0]}{" "}
              <Text className="text-blue-300">{heroTitle[1]}</Text>
            </Text>

            {/* Subtitle */}
            <Text className="mt-2 text-sm text-indigo-200/80 leading-relaxed max-w-sm">
              {heroSubtitle}
            </Text>
          </View>

          {/* Form Card Area (White Sheet) */}
          <View className="flex-1 rounded-t-3xl bg-slate-50 px-6 pt-6 pb-10 shadow-lg">
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AuthLayout;
