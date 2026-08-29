// app/(onboarding)/preferences.tsx
// Phase 4: Step 6 Matching Preferences & Location-Preference Scope

import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import ProgressBar from "../../components/ui/ProgressBar";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import userService from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import { MatchPreferenceType } from "../../types";
import { HeartHandshake, Church, Compass, Sparkles } from "lucide-react-native";

const SCOPE_OPTIONS: Array<{
  value: MatchPreferenceType;
  title: string;
  subtitle: string;
  badge: string;
  icon: any;
}> = [
  {
    value: "my_church",
    title: "Within My Church Only",
    subtitle: "Exclusively surface believers within your direct denomination and local parish.",
    badge: "Parish Focused",
    icon: Church,
  },
  {
    value: "my_church_plus",
    title: "Within Church + Other Churches",
    subtitle: "Prioritize your church while exploring compatible believers from sister faith bodies.",
    badge: "Recommended",
    icon: Sparkles,
  },
  {
    value: "other_churches",
    title: "Other Churches Only",
    subtitle: "Explore marriage-minded believers outside your home parish.",
    badge: "Broader Search",
    icon: Compass,
  },
];

export default function PreferencesScreen() {
  const router = useRouter();
  const { user, updateLocalUser } = useAuth();

  const [preference, setPreference] = useState<MatchPreferenceType>(
    user?.matchPreference || "my_church_plus",
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleContinue = async () => {
    setIsSaving(true);
    try {
      if (user?.accountId) {
        await userService.updateProfile(user.accountId, {
          matchPreference: preference,
        } as any);

        updateLocalUser({
          matchPreference: preference,
        });
      }
      router.push("/(onboarding)/completion-review" as any);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save match preference.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenWrapper
      title="Match Scope"
      subtitle="Step 6 of 7"
      showBack={true}
    >
      <ProgressBar currentStep={6} totalSteps={7} label="Step 6: Preferences" />

      <Text className="text-2xl font-black text-slate-900 mb-1">
        Define Your Matching Scope
      </Text>
      <Text className="text-sm text-slate-500 mb-5">
        Choose your denominational search boundary. Proximity weighting will rank closer believers first.
      </Text>

      <View className="gap-3.5 mb-6">
        {SCOPE_OPTIONS.map((option) => {
          const isSelected = preference === option.value;
          const IconComponent = option.icon;

          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => setPreference(option.value)}
              activeOpacity={0.8}
            >
              <Card
                className={`border-2 transition-all ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/40 shadow-sm"
                    : "border-slate-200 bg-white"
                }`}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-row items-center flex-1 mr-2">
                    <View
                      className={`mr-3 rounded-2xl p-3 ${
                        isSelected ? "bg-blue-600" : "bg-slate-100"
                      }`}
                    >
                      <IconComponent
                        size={20}
                        color={isSelected ? "#FFFFFF" : "#64748B"}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-bold text-slate-900">
                        {option.title}
                      </Text>
                      <Text className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {option.subtitle}
                      </Text>
                    </View>
                  </View>
                  <Badge
                    label={option.badge}
                    variant={isSelected ? "primary" : "neutral"}
                  />
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </View>

      <Button
        title="Review & Complete Profile"
        isLoading={isSaving}
        onPress={handleContinue}
        className="mb-8"
      />
    </ScreenWrapper>
  );
}
