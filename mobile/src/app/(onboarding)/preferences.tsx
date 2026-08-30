// app/(onboarding)/preferences.tsx
// Phase 4: Step 6 Matching Preferences & Interests Selection (at least 3 required)

import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import ProgressBar from "../../components/ui/ProgressBar";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import userService from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import { MatchPreferenceType } from "../../types";
import { Church, Compass, Sparkles, Check, Heart } from "lucide-react-native";

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

const AVAILABLE_INTERESTS: string[] = [
  "Bible Study & Theology",
  "Worship & Sacred Music",
  "Community Outreach & Missions",
  "Christian Literature & Reading",
  "Fitness, Running & Sports",
  "Travel, Culture & Pilgrimages",
  "Culinary Arts & Hospitality",
  "Technology & Innovation",
  "Family, Youth & Mentorship",
  "Creative Arts & Design",
  "Nature, Gardening & Outdoors",
  "Entrepreneurship & Leadership",
];

export default function PreferencesScreen() {
  const router = useRouter();
  const { user, updateLocalUser } = useAuth();

  const [preference, setPreference] = useState<MatchPreferenceType>(
    user?.matchPreference || "my_church_plus",
  );

  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    Array.isArray(user?.interests) ? (user?.interests as string[]) : [],
  );

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const toggleInterest = (interest: string) => {
    setError("");
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleContinue = async () => {
    if (selectedInterests.length < 3) {
      setError("Please select at least 3 interests to ensure faith and compatibility alignment.");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      if (user?.accountId) {
        await userService.updateProfile(user.accountId, {
          matchPreference: preference,
          interests: selectedInterests,
        } as any);

        updateLocalUser({
          matchPreference: preference,
          interests: selectedInterests,
        });
      }
      router.push("/(onboarding)/completion-review" as any);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save match preferences.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenWrapper
      title="Preferences & Interests"
      subtitle="Step 6 of 7"
      showBack={true}
    >
      <ProgressBar currentStep={6} totalSteps={7} label="Step 6: Preferences" />

      {/* Section 1: Interests */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-xl font-black text-slate-900">
            Faith & Lifestyle Interests
          </Text>
          <Badge
            label={`${selectedInterests.length}/3 minimum`}
            variant={selectedInterests.length >= 3 ? "success" : "warning"}
          />
        </View>
        <Text className="text-xs text-slate-500 mb-3">
          Select at least 3 passions to help counselors and potential matches understand your lifestyle.
        </Text>

        <View className="flex-row flex-wrap gap-2">
          {AVAILABLE_INTERESTS.map((interest) => {
            const isSelected = selectedInterests.includes(interest);
            return (
              <TouchableOpacity
                key={interest}
                onPress={() => toggleInterest(interest)}
                activeOpacity={0.7}
                className={`flex-row items-center px-3.5 py-2 rounded-full border ${
                  isSelected
                    ? "bg-blue-600 border-blue-600 shadow-xs"
                    : "bg-white border-slate-200"
                }`}
              >
                {isSelected && (
                  <Check size={14} color="#FFFFFF" className="mr-1.5" />
                )}
                <Text
                  className={`text-xs font-semibold ${
                    isSelected ? "text-white" : "text-slate-700"
                  }`}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {error ? (
          <Text className="text-xs font-medium text-red-600 mt-2">{error}</Text>
        ) : null}
      </View>

      {/* Section 2: Matching Scope */}
      <View className="mb-6">
        <Text className="text-xl font-black text-slate-900 mb-1">
          Define Your Matching Scope
        </Text>
        <Text className="text-xs text-slate-500 mb-4">
          Choose your denominational search boundary. Proximity weighting ranks closer believers first.
        </Text>

        <View className="gap-3">
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
