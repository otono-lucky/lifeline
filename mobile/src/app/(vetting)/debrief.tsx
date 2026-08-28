// app/(vetting)/debrief.tsx
// Post-Relationship Counselor-Mediated Status Reset Screen

import React from "react";
import { View, Text } from "react-native";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { MessageSquareHeart } from "lucide-react-native";

export default function DebriefScreen() {
  return (
    <ScreenWrapper
      title="Exit Debrief Required"
      isScrollable={false}
    >
      <View className="flex-1 items-center justify-center py-6">
        <View className="mb-6 rounded-full bg-purple-500/10 p-6 border-2 border-purple-200">
          <MessageSquareHeart size={48} color="#7C3AED" />
        </View>

        <Text className="text-2xl font-bold text-slate-900 text-center mb-2">
          Relationship Concluded
        </Text>
        <Text className="text-base text-slate-500 text-center mb-6 max-w-xs leading-relaxed">
          To maintain intentionality and emotional health, users concluding a match undergo a brief debrief with their counselor before re-entering the discovery pool.
        </Text>

        <Card className="w-full mb-6">
          <Text className="text-sm font-bold text-slate-800 mb-1">Status:</Text>
          <Text className="text-xs text-slate-600">
            Awaiting counselor debrief session. Once completed, your profile will be re-indexed into discovery.
          </Text>
        </Card>

        <Button
          title="Contact Assigned Counselor"
          onPress={() => {}}
          className="w-full"
        />
      </View>
    </ScreenWrapper>
  );
}
