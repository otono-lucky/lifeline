// app/(onboarding)/completion-review.tsx
// Phase 4: Step 7 100% Score Review & Submit for Counselor Vetting

import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import ProgressBar from "../../components/ui/ProgressBar";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  MapPin,
  Church,
  DollarSign,
  Camera,
  ShieldCheck,
  Compass,
  Edit3,
} from "lucide-react-native";

export default function CompletionReviewScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { profile } = useUserProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const current = profile || user;

  const checklist = [
    {
      title: "Church & Parish",
      value: current?.churchName
        ? current?.branchName
          ? `${current.churchName} (${current.branchName})`
          : current.churchName
        : "No church selected",
      icon: Church,
      isComplete: Boolean(current?.churchId),
      route: "/(onboarding)/church-selection?from=review",
    },
    {
      title: "Origin & Residence",
      value: current?.residenceState
        ? `${current.residenceCity || "City"}, ${current.residenceState} (Origin: ${current.originState || "N/A"})`
        : "Location not provided",
      icon: MapPin,
      isComplete: Boolean(current?.residenceState && current?.residenceAddress),
      route: "/(onboarding)/location-profile?from=review",
    },
    {
      title: "Career & Financial Bracket",
      value: current?.occupation
        ? `${current.occupation} • ${current.salaryRange ? current.salaryRange.replace("RANGE_", "").replace("_", " - ") : "Bracket set"}`
        : "Career details not provided",
      icon: DollarSign,
      isComplete: Boolean(current?.occupation && current?.dateOfBirth),
      route: "/(onboarding)/career-financial?from=review",
    },
    {
      title: "Social Identity (2-of-3)",
      value: current?.socials && current.socials.length >= 2
        ? `${current.socials.map((s) => s.platform).join(", ")} connected`
        : "Minimum 2 handles required",
      icon: ShieldCheck,
      isComplete: Boolean(current?.socials && current.socials.length >= 2),
      route: "/(onboarding)/social-identity?from=review",
    },
    {
      title: "Media & Liveness Video",
      value: `${current?.photos?.length || 0} of 3 Photos ${current?.videoIntroUrl ? "• Video Intro attached" : "• Missing video"}`,
      icon: Camera,
      isComplete: Boolean((current?.photos?.length || 0) === 3 && current?.videoIntroUrl),
      route: "/(onboarding)/media-upload?from=review",
    },
    {
      title: "Preferences & Interests",
      value: `${current?.matchPreference ? current.matchPreference.replace(/_/g, " ") : "Not set"} • ${(current?.interests as string[])?.length || 0} interests selected`,
      icon: Compass,
      isComplete: Boolean(
        current?.matchPreference && ((current?.interests as string[])?.length || 0) >= 3,
      ),
      route: "/(onboarding)/preferences?from=review",
    },
  ];

  const allComplete = checklist.every((item) => item.isComplete);
  const completionPercentage = current?.profileCompletionPercentage || (allComplete ? 100 : Math.round((checklist.filter((i) => i.isComplete).length / checklist.length) * 100));

  const handleSubmitForVetting = async () => {
    if (!allComplete) {
      Alert.alert(
        "Profile Incomplete",
        "Please complete all sections before submitting your profile for counselor vetting.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await refreshUser();
      router.replace("/(vetting)/pending" as any);
    } catch (err: any) {
      Alert.alert("Submission Error", err.message || "Failed to submit profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenWrapper
      title="Profile Review"
      subtitle="Final Verification"
      showBack={true}
      onBack={() => router.push("/(onboarding)/preferences" as any)}
    >
      <ProgressBar currentStep={7} totalSteps={7} label={`Step 7: ${completionPercentage}% Score`} />

      {/* Hero Card */}
      <Card className="mb-6 bg-indigo-950 p-6 border-0 shadow-md">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="mr-3 rounded-2xl bg-blue-500/20 p-3 border border-blue-400/30">
              <Sparkles size={24} color="#93C5FD" />
            </View>
            <View>
              <Text className="text-xl font-black text-white">
                {completionPercentage}% Complete
              </Text>
              <Text className="text-xs font-semibold text-blue-200">
                {allComplete ? "Ready for Counselor Vetting" : "Complete Missing Sections"}
              </Text>
            </View>
          </View>
          <Badge
            label={allComplete ? "100% Vetted Score" : `${completionPercentage}% Score`}
            variant={allComplete ? "primary" : "warning"}
          />
        </View>

        <Text className="text-xs text-indigo-200/80 leading-relaxed">
          {allComplete
            ? "All high-integrity profiling requirements have been satisfied. Submitting your profile triggers the pastoral verification pipeline."
            : "Review each section below. You can tap Edit on any item to update or complete missing information."}
        </Text>
      </Card>

      {/* Detailed Checklist */}
      <Text className="text-sm font-bold text-slate-900 mb-3">
        Verification Checklist
      </Text>

      <View className="gap-3 mb-6">
        {checklist.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Card
              key={index}
              className={`p-4 border transition-all ${
                item.isComplete ? "border-slate-200 bg-white" : "border-amber-200 bg-amber-50/20"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1 mr-2">
                  <View
                    className={`mr-3 rounded-xl p-2 ${
                      item.isComplete ? "bg-blue-50" : "bg-amber-100"
                    }`}
                  >
                    <IconComponent
                      size={18}
                      color={item.isComplete ? "#2563EB" : "#D97706"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-slate-900">
                      {item.title}
                    </Text>
                    <Text
                      className={`text-xs mt-0.5 ${
                        item.isComplete ? "text-slate-500" : "text-amber-700 font-medium"
                      }`}
                      numberOfLines={1}
                    >
                      {item.value}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() => router.push(item.route as any)}
                    className="flex-row items-center px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 active:bg-slate-200"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Edit3 size={12} color="#2563EB" />
                    <Text className="text-xs font-semibold text-blue-600 ml-1">Edit</Text>
                  </TouchableOpacity>

                  {item.isComplete ? (
                    <CheckCircle2 size={20} color="#16A34A" />
                  ) : (
                    <AlertTriangle size={20} color="#D97706" />
                  )}
                </View>
              </View>
            </Card>
          );
        })}
      </View>

      <Button
        title={allComplete ? "Submit Profile to Counselor" : "Complete Missing Sections"}
        disabled={!allComplete}
        isLoading={isSubmitting}
        onPress={handleSubmitForVetting}
        className="mb-8"
      />
    </ScreenWrapper>
  );
}

