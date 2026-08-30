// app/(vetting)/debrief.tsx
// Phase 5: Post-Relationship Counselor-Mediated Debrief Reset Screen

import React, { useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";
import { HeartCrack, MessageSquareHeart, RefreshCw } from "lucide-react-native";

export default function DebriefScreen() {
  const router = useRouter();
  const { user, refreshUser, logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshUser();
    setIsRefreshing(false);
    if (user?.vettingStatus === "VETTED_ACTIVE") {
      router.replace("/(app)/(tabs)/discovery" as any);
    }
  };

  return (
    <ScreenWrapper
      title="Exit Debrief"
      isScrollable={true}
    >
      <View className="py-4 items-center">
        <View className="mb-6 rounded-full bg-purple-500/10 p-7 border-2 border-purple-400/30">
          <HeartCrack size={52} color="#7C3AED" />
        </View>

        <Badge label="Status: Debrief Required" variant="purple" className="mb-3" />

        <Text className="text-2xl font-black text-slate-900 text-center mb-2">
          Relationship Concluded
        </Text>
        <Text className="text-sm text-slate-500 text-center mb-6 max-w-xs leading-relaxed">
          To maintain emotional health and intentionality within the covenant community, concluding a match requires a brief debrief with your assigned counselor before re-entering the discovery pool.
        </Text>

        <Card className="w-full mb-6 bg-purple-50/40 border border-purple-200">
          <View className="flex-row items-center mb-2">
            <MessageSquareHeart size={20} color="#7C3AED" />
            <Text className="ml-2 text-xs font-bold uppercase tracking-wider text-purple-900">
              Debrief Process:
            </Text>
          </View>
          <Text className="text-xs text-purple-900/90 leading-relaxed mb-2">
            • Your counselor will conduct a short reflection conversation.
          </Text>
          <Text className="text-xs text-purple-900/90 leading-relaxed mb-2">
            • Once completed, the counselor resets your status to Vetted/Active.
          </Text>
          <Text className="text-xs text-purple-900/90 leading-relaxed">
            • Your 3-slot discovery feed will be restored immediately.
          </Text>
        </Card>

        <Button
          title="Check Debrief Status"
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
