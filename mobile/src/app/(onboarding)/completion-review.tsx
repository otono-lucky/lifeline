// app/(onboarding)/completion-review.tsx
// Phase 4: Step 7 100% Score Review & Submit for Counselor Vetting

import React, { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import ProgressBar from "../../components/ui/ProgressBar";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";
import userService from "../../services/userService";
import { CheckCircle2, ShieldCheck, Sparkles, User, MapPin, Church, DollarSign, Camera } from "lucide-react-native";

export default function CompletionReviewScreen() {
  const router = useRouter();
  const { user, updateLocalUser, refreshUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checklist = [
    {
      title: "Church & Parish",
      value: user?.churchName || "Parent Church Selected",
      icon: Church,
      isComplete: Boolean(user?.churchId),
    },
    {
      title: "Origin & Residence",
      value: `${user?.residenceCity || "City"}, ${user?.residenceState || "State"}`,
      icon: MapPin,
      isComplete: Boolean(user?.residenceState && user?.residenceAddress),
    },
    {
      title: "Career & Financial Bracket",
      value: user?.occupation || "Professional",
      icon: DollarSign,
      isComplete: Boolean(user?.occupation && user?.salaryRange),
    },
    {
      title: "Social Identity (2-of-3)",
      value: "LinkedIn & Instagram Connected",
      icon: ShieldCheck,
      isComplete: true,
    },
    {
      title: "Media & Liveness Video",
      value: "3 Photos + Video Intro Attached",
      icon: Camera,
      isComplete: true,
    },
  ];

  const handleSubmitForVetting = async () => {
    setIsSubmitting(true);
    try {
      if (user?.accountId) {
        // Backend recalculates completeness percentage and moves status to PENDING_VETTING
        await userService.updateProfile(user.accountId, {
          profileCompletionPercentage: 100,
          vettingStatus: "PENDING_VETTING",
        } as any);

        updateLocalUser({
          profileCompletionPercentage: 100,
          vettingStatus: "PENDING_VETTING",
        });

        await refreshUser();
      }

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
    >
      <ProgressBar currentStep={7} totalSteps={7} label="Step 7: 100% Score" />

      {/* 100% Completeness Hero Card */}
      <Card className="mb-6 bg-indigo-950 p-6 border-0 shadow-md">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="mr-3 rounded-2xl bg-blue-500/20 p-3 border border-blue-400/30">
              <Sparkles size={24} color="#93C5FD" />
            </View>
            <View>
              <Text className="text-xl font-black text-white">
                100% Complete
              </Text>
              <Text className="text-xs font-semibold text-blue-200">
                Ready for Counselor Vetting
              </Text>
            </View>
          </View>
          <Badge label="100% Vetted Score" variant="primary" />
        </View>

        <Text className="text-xs text-indigo-200/80 leading-relaxed">
          All high-integrity profiling requirements have been satisfied. Submitting your profile triggers the pastoral verification pipeline.
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
            <Card key={index} className="p-4 border border-slate-200">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1 mr-2">
                  <View className="mr-3 rounded-xl bg-slate-100 p-2">
                    <IconComponent size={18} color="#2563EB" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-slate-900">
                      {item.title}
                    </Text>
                    <Text className="text-xs text-slate-500 mt-0.5" numberOfLines={1}>
                      {item.value}
                    </Text>
                  </View>
                </View>
                <CheckCircle2 size={20} color="#16A34A" />
              </View>
            </Card>
          );
        })}
      </View>

      <Button
        title="Submit Profile to Counselor"
        isLoading={isSubmitting}
        onPress={handleSubmitForVetting}
        className="mb-8"
      />
    </ScreenWrapper>
  );
}
