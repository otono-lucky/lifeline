// app/(onboarding)/social-identity.tsx
// Step 4: Social Identity Verification ("2-of-3" Logic Gate across LinkedIn, IG, FB)

import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import ProgressBar from "../../components/ui/ProgressBar";
import Button from "../../components/ui/Button";

export default function SocialIdentityScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper
      title="Identity Verification"
      subtitle="Step 4 of 7"
      showBack={true}
    >
      <ProgressBar currentStep={4} totalSteps={7} label="Step 4: Socials" />

      <Text className="text-xl font-bold text-slate-900 mb-1">
        Social Verification (2 of 3 Required)
      </Text>
      <Text className="text-sm text-slate-500 mb-6">
        Connect at least two social profiles (LinkedIn, Instagram, Facebook) for identity assurance.
      </Text>

      <View className="rounded-2xl border border-dashed border-slate-300 p-8 items-center justify-center my-4">
        <Text className="text-slate-400 font-medium text-center">
          [LinkedIn, Instagram, Facebook Handle Inputs Shell]
        </Text>
      </View>

      <Button
        title="Continue to Photos & Video"
        onPress={() => router.push("/(onboarding)/media-upload" as any)}
        className="mt-6"
      />
    </ScreenWrapper>
  );
}
