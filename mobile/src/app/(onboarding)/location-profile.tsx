// app/(onboarding)/location-profile.tsx
// Step 2: Origin and Geocoded Residence Location

import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import ProgressBar from "../../components/ui/ProgressBar";
import Button from "../../components/ui/Button";

export default function LocationProfileScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper
      title="Location & Heritage"
      subtitle="Step 2 of 7"
      showBack={true}
    >
      <ProgressBar currentStep={2} totalSteps={7} label="Step 2: Location" />

      <Text className="text-xl font-bold text-slate-900 mb-1">
        Where are you based?
      </Text>
      <Text className="text-sm text-slate-500 mb-6">
        Provide your place of origin and current residential city for distance matching.
      </Text>

      <View className="rounded-2xl border border-dashed border-slate-300 p-8 items-center justify-center my-4">
        <Text className="text-slate-400 font-medium text-center">
          [State of Origin & Residence Geocoding Autocomplete Shell]
        </Text>
      </View>

      <Button
        title="Continue to Career & Finance"
        onPress={() => router.push("/(onboarding)/career-financial" as any)}
        className="mt-6"
      />
    </ScreenWrapper>
  );
}
