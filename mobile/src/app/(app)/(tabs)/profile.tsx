// app/(app)/(tabs)/profile.tsx
// User Profile & Periodic Subscription Management (Monthly/Yearly)

import React from "react";
import { View, Text } from "react-native";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";
import Button from "../../../components/ui/Button";
import { useAuth } from "../../../context/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <ScreenWrapper
      title="My Profile"
      subtitle={user?.email || "Account & Subscriptions"}
      isScrollable={true}
    >
      <View className="rounded-3xl border border-dashed border-slate-300 p-12 items-center justify-center my-6">
        <Text className="text-slate-400 font-medium text-center">
          [User Profile View, Photo Gallery & Subscription Tier Manager Shell]
        </Text>
      </View>

      <Button
        title="Log Out"
        variant="danger"
        onPress={logout}
        className="mt-6"
      />
    </ScreenWrapper>
  );
}
