// app/(vetting)/pending.tsx
// Phase 5: Pending Vetting Screen (Awaiting Counselor Call)

import React, { useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";
import { Clock, ShieldCheck, PhoneCall, Calendar, RefreshCw } from "lucide-react-native";

export default function PendingVettingScreen() {
  const router = useRouter();
  const { user, refreshUser, logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshUser();
    setIsRefreshing(false);
    // If status became VETTED_ACTIVE, redirect to discovery
    if (user?.vettingStatus === "VETTED_ACTIVE") {
      router.replace("/(app)/(tabs)/discovery" as any);
    }
  };

  return (
    <ScreenWrapper
      title="Verification Status"
      headerBackground="indigo"
      isScrollable={true}
    >
      <View className="py-4 items-center">
        {/* Status Animated Icon Container */}
        <View className="mb-6 rounded-full bg-blue-500/10 p-7 border-2 border-blue-400/30">
          <Clock size={52} color="#2563EB" />
        </View>

        <Badge label="Status: Pending Vetting" variant="warning" className="mb-3" />

        <Text className="text-2xl font-black text-slate-900 text-center mb-2">
          Awaiting Counselor Review
        </Text>
        <Text className="text-sm text-slate-500 text-center mb-6 max-w-xs leading-relaxed">
          Your profile has reached 100% completion. Your church's designated counselor is reviewing your information and will reach out for a brief interview.
        </Text>

        {/* What to Expect Card */}
        <Card className="w-full mb-4 bg-white border border-slate-200">
          <Text className="text-sm font-bold text-slate-900 mb-3">
            What Happens Next?
          </Text>

          <View className="flex-row items-start mb-3">
            <View className="mr-3 rounded-lg bg-blue-50 p-2">
              <PhoneCall size={16} color="#2563EB" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-bold text-slate-800">
                1. WhatsApp Video / Voice Call
              </Text>
              <Text className="text-xs text-slate-500 mt-0.5">
                Counselor connects on {user?.whatsappNumber || "your phone number"}.
              </Text>
            </View>
          </View>

          <View className="flex-row items-start mb-3">
            <View className="mr-3 rounded-lg bg-blue-50 p-2">
              <ShieldCheck size={16} color="#2563EB" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-bold text-slate-800">
                2. Faith & Heritage Alignment
              </Text>
              <Text className="text-xs text-slate-500 mt-0.5">
                Brief conversation to confirm marriage intentions and background.
              </Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <View className="mr-3 rounded-lg bg-blue-50 p-2">
              <Calendar size={16} color="#2563EB" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-bold text-slate-800">
                3. Entry into Discovery Pool
              </Text>
              <Text className="text-xs text-slate-500 mt-0.5">
                Upon counselor approval, your 3-slot discovery feed activates immediately.
              </Text>
            </View>
          </View>
        </Card>

        {/* Refresh & Log Out Buttons */}
        <Button
          title="Check Approval Status"
          leftIcon={<RefreshCw size={18} color="#FFFFFF" />}
          isLoading={isRefreshing}
          onPress={handleRefresh}
          className="w-full mb-3"
        />

        <Button
          title="Sign Out"
          variant="ghost"
          onPress={logout}
          className="w-full"
        />
      </View>
    </ScreenWrapper>
  );
}
