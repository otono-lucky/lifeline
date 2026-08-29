// app/(app)/(tabs)/profile.tsx
// Phase 8: User Profile View & Periodic Subscription Management

import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Avatar from "../../../components/ui/Avatar";
import { useAuth } from "../../../context/AuthContext";
import {
  Church,
  MapPin,
  Briefcase,
  ShieldCheck,
  CreditCard,
  LogOut,
  Edit,
  Sparkles,
  ChevronRight,
} from "lucide-react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out of Lifeline?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login" as any);
        },
      },
    ]);
  };

  const fullName = `${user?.firstName || "Faith"} ${user?.lastName || "Believer"}`;
  const primaryPhoto = user?.photos?.[0]?.photoUrl;
  const isPremium = user?.subscriptionTier === "premium";

  return (
    <ScreenWrapper
      title="My Profile"
      subtitle="Account details & covenant membership"
      isScrollable={true}
    >
      {/* Profile Header Card */}
      <Card className="mb-5 p-5 border border-slate-200 shadow-sm">
        <View className="flex-row items-center">
          <Avatar
            url={primaryPhoto}
            name={fullName}
            size="lg"
            isVerified={user?.isVerified}
          />
          <View className="ml-4 flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-xl font-black text-slate-900" numberOfLines={1}>
                {fullName}
              </Text>
              <Badge
                label={user?.vettingStatus === "VETTED_ACTIVE" ? "Vetted" : "Active"}
                variant="success"
              />
            </View>

            <View className="flex-row items-center mt-0.5">
              <Church size={13} color="#2563EB" />
              <Text className="ml-1.5 text-xs text-slate-600 font-medium" numberOfLines={1}>
                {user?.churchName || "Christian Parish"}
                {user?.branchName ? ` • ${user.branchName}` : ""}
              </Text>
            </View>

            <View className="flex-row items-center mt-0.5">
              <MapPin size={13} color="#64748B" />
              <Text className="ml-1.5 text-xs text-slate-500">
                {user?.residenceCity || "City"}, {user?.residenceState || "State"}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(onboarding)/church-selection" as any)}
          className="mt-4 flex-row items-center justify-center rounded-xl bg-slate-100 py-2.5 active:bg-slate-200"
        >
          <Edit size={14} color="#64748B" />
          <Text className="ml-1.5 text-xs font-bold text-slate-700">
            Edit Full Profile
          </Text>
        </TouchableOpacity>
      </Card>

      {/* Periodic Subscription Tier Card */}
      <Card className="mb-5 bg-gradient-to-r from-blue-900 to-indigo-950 p-5 border-0 shadow-md">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <View className="mr-3 rounded-xl bg-blue-500/20 p-2.5 border border-blue-400/30">
              <Sparkles size={20} color="#93C5FD" />
            </View>
            <View>
              <Text className="text-base font-black text-white">
                {isPremium ? "Covenant Membership Active" : "Free Explorer"}
              </Text>
              <Text className="text-xs text-blue-200">
                {isPremium
                  ? `Plan: ${user?.subscriptionInterval || "MONTHLY"} • Uninterrupted Access`
                  : "Upgrade for 3-slot discovery and counselor guidance"}
              </Text>
            </View>
          </View>
          <Badge
            label={isPremium ? "Premium" : "Free"}
            variant={isPremium ? "success" : "neutral"}
          />
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(app)/modal/subscription-tier" as any)}
          className="mt-3 flex-row items-center justify-between rounded-xl bg-white/10 px-4 py-2.5 border border-white/20"
        >
          <Text className="text-xs font-bold text-white">
            {isPremium ? "Manage Subscription Plan" : "View Covenant Plans (Monthly / Yearly)"}
          </Text>
          <ChevronRight size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </Card>

      {/* Confidential Financial Bracket (Privacy Firewall Card) */}
      <Card className="mb-5 bg-blue-50/50 border border-blue-200 p-4">
        <View className="flex-row items-center mb-1.5">
          <ShieldCheck size={18} color="#2563EB" />
          <Text className="ml-2 text-xs font-bold uppercase tracking-wider text-blue-900">
            Confidential Financial Data (Privacy Firewall)
          </Text>
        </View>
        <Text className="text-xs text-blue-800 leading-relaxed mb-2">
          Bracket: <Text className="font-bold">{user?.salaryRange?.replace(/_/g, " ") || "RANGE 100K-500K"}</Text> • Hidden from all prospects and church admins.
        </Text>
      </Card>

      {/* 3 Photos Gallery Preview */}
      <View className="mb-5">
        <Text className="text-sm font-bold text-slate-900 mb-2">
          Profile Photos ({user?.photos?.length || 3}/3)
        </Text>
        <View className="flex-row gap-3">
          {[0, 1, 2].map((idx) => {
            const photo =
              user?.photos?.[idx]?.photoUrl ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500";
            return (
              <View
                key={idx}
                className="flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200"
              >
                <Image source={{ uri: photo }} className="w-full h-full object-cover" />
              </View>
            );
          })}
        </View>
      </View>

      {/* Sign Out Button */}
      <Button
        title="Sign Out of Lifeline"
        variant="danger"
        leftIcon={<LogOut size={18} color="#FFFFFF" />}
        onPress={handleLogout}
        className="mb-8"
      />
    </ScreenWrapper>
  );
}
