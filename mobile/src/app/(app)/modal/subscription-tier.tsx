// app/(app)/modal/subscription-tier.tsx
// Phase 8: Periodic Subscription Selector Modal (Monthly vs Yearly)

import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import subscriptionService from "../../../services/subscriptionService";
import { SubscriptionPlanInterval } from "../../../types";
import { Sparkles, CheckCircle2, Shield, Heart } from "lucide-react-native";

export default function SubscriptionTierModal() {
  const router = useRouter();
  const [selectedInterval, setSelectedInterval] = useState<SubscriptionPlanInterval>("MONTHLY");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const perks = [
    "Uninterrupted access to the 3-Slot Discovery Feed",
    "Dedicated pastoral counselor review and ongoing guidance",
    "Private encrypted couple channels upon mutual match",
    "Dynamic in-app video & voice calendar synchronization",
    "No transactional pay-per-match friction",
  ];

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      const response = await subscriptionService.subscribe(selectedInterval);
      if (response.success) {
        Alert.alert(
          "Subscription Active! 🌟",
          `You have successfully subscribed to the ${selectedInterval.toLowerCase()} covenant plan.`,
          [{ text: "OK", onPress: () => router.back() }],
        );
      }
    } catch (err: any) {
      Alert.alert("Subscription Error", err.message || "Failed to complete subscription.");
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <ScreenWrapper
      title="Lifeline Covenant Access"
      subtitle="Periodic Subscription for continuous pastoral oversight"
      showBack={true}
      onBack={() => router.back()}
      isScrollable={true}
    >
      {/* Hero Header */}
      <Card className="mb-6 bg-indigo-950 p-6 border-0 shadow-md">
        <View className="flex-row items-center mb-3">
          <View className="mr-3 rounded-2xl bg-blue-500/20 p-3 border border-blue-400/30">
            <Sparkles size={24} color="#93C5FD" />
          </View>
          <View>
            <Text className="text-xl font-black text-white">
              Covenant Membership
            </Text>
            <Text className="text-xs font-semibold text-blue-200">
              Sustainable, Marriage-Focused Model
            </Text>
          </View>
        </View>

        <Text className="text-xs text-indigo-200/80 leading-relaxed">
          Lifeline avoids the misaligned incentives of "pay-per-match" models by providing continuous monthly or yearly access during vetting and courtship.
        </Text>
      </Card>

      {/* Plan Selection Cards */}
      <Text className="text-sm font-bold text-slate-900 mb-3">Choose Your Plan</Text>

      <View className="gap-3 mb-6">
        {/* Monthly Option */}
        <TouchableOpacity
          onPress={() => setSelectedInterval("MONTHLY")}
          activeOpacity={0.8}
        >
          <Card
            className={`border-2 transition-all ${
              selectedInterval === "MONTHLY"
                ? "border-blue-600 bg-blue-50/40 shadow-sm"
                : "border-slate-200 bg-white"
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-base font-bold text-slate-900">
                  Monthly Membership
                </Text>
                <Text className="text-xs text-slate-500 mt-0.5">
                  Billed monthly • Cancel anytime
                </Text>
                <Text className="text-xl font-black text-blue-600 mt-2">
                  ₦5,000 <Text className="text-xs font-normal text-slate-500">/ month</Text>
                </Text>
              </View>

              {selectedInterval === "MONTHLY" && (
                <Badge label="Selected" variant="primary" />
              )}
            </View>
          </Card>
        </TouchableOpacity>

        {/* Yearly Option */}
        <TouchableOpacity
          onPress={() => setSelectedInterval("YEARLY")}
          activeOpacity={0.8}
        >
          <Card
            className={`border-2 transition-all ${
              selectedInterval === "YEARLY"
                ? "border-blue-600 bg-blue-50/40 shadow-sm"
                : "border-slate-200 bg-white"
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-base font-bold text-slate-900">
                    Annual Covenant Plan
                  </Text>
                  <Badge label="Save 25%" variant="success" />
                </View>
                <Text className="text-xs text-slate-500 mt-0.5">
                  Full 12-month uninterrupted guidance
                </Text>
                <Text className="text-xl font-black text-blue-600 mt-2">
                  ₦45,000 <Text className="text-xs font-normal text-slate-500">/ year</Text>
                </Text>
              </View>

              {selectedInterval === "YEARLY" && (
                <Badge label="Selected" variant="primary" />
              )}
            </View>
          </Card>
        </TouchableOpacity>
      </View>

      {/* Feature Checklist */}
      <Card className="mb-6 bg-slate-50 border border-slate-200">
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
          Included In Membership:
        </Text>
        {perks.map((perk, idx) => (
          <View key={idx} className="flex-row items-center mb-2">
            <CheckCircle2 size={16} color="#16A34A" />
            <Text className="ml-2.5 text-xs text-slate-700 font-medium">
              {perk}
            </Text>
          </View>
        ))}
      </Card>

      <Button
        title={`Subscribe ${selectedInterval === "MONTHLY" ? "Monthly" : "Annually"}`}
        isLoading={isSubscribing}
        onPress={handleSubscribe}
        className="mb-8"
      />
    </ScreenWrapper>
  );
}
