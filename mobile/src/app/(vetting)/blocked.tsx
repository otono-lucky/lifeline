// app/(vetting)/blocked.tsx
// Phase 5: Account Blocked & Appeals Process with SuperAdmin

import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import vettingService from "../../services/vettingService";
import { useAuth } from "../../context/AuthContext";
import { ShieldAlert, Send } from "lucide-react-native";

export default function BlockedVettingScreen() {
  const { logout } = useAuth();
  const [appealReason, setAppealReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitAppeal = async () => {
    if (!appealReason.trim()) {
      Alert.alert("Required", "Please provide reasons for your appeal.");
      return;
    }

    setIsSubmitting(true);
    try {
      await vettingService.submitAppeal(appealReason.trim());
      setIsSubmitted(true);
    } catch (err: any) {
      Alert.alert("Submission Failed", err.message || "Failed to submit appeal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenWrapper
      title="Account Restricted"
      isScrollable={true}
    >
      <View className="py-4 items-center">
        <View className="mb-6 rounded-full bg-red-500/10 p-7 border-2 border-red-400/30">
          <ShieldAlert size={52} color="#DC2626" />
        </View>

        <Badge label="Status: Account Restricted" variant="danger" className="mb-3" />

        <Text className="text-2xl font-black text-slate-900 text-center mb-2">
          Account Status Restricted
        </Text>
        <Text className="text-sm text-slate-500 text-center mb-6 max-w-xs leading-relaxed">
          Following counselor review, your profile was marked as restricted. You may submit an official appeal to platform system administrators.
        </Text>

        {isSubmitted ? (
          <Card className="w-full mb-6 bg-green-50 border border-green-200 p-6">
            <Text className="text-sm font-bold text-green-900 mb-1 text-center">
              Appeal Under Review
            </Text>
            <Text className="text-xs text-green-700 text-center leading-relaxed">
              Your appeal has been dispatched to the SuperAdmin panel. You will be contacted regarding the final decision.
            </Text>
          </Card>
        ) : (
          <Card className="w-full mb-6">
            <Text className="text-sm font-bold text-slate-900 mb-1">
              Submit Reconsideration Appeal
            </Text>
            <Text className="text-xs text-slate-500 mb-4">
              Please explain your circumstances and clarify your commitment to intentional marriage preparation.
            </Text>

            <Input
              label="Appeal Statement"
              placeholder="State your reasons clearly..."
              multiline
              numberOfLines={4}
              value={appealReason}
              onChangeText={(text) => setAppealReason(text)}
            />

            <Button
              title="Submit Appeal to SuperAdmin"
              variant="danger"
              rightIcon={<Send size={18} color="#FFFFFF" />}
              isLoading={isSubmitting}
              onPress={handleSubmitAppeal}
              className="mt-2"
            />
          </Card>
        )}

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
