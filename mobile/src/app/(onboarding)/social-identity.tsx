// app/(onboarding)/social-identity.tsx
// Phase 4: Step 4 Social Identity Verification ("2-of-3" Logic Gate across LinkedIn, Instagram, Facebook)

import React, { useState, useEffect } from "react";
import { View, Text, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import ProgressBar from "../../components/ui/ProgressBar";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import userService from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import { SocialMediaHandle } from "../../types";
import { Globe, Share2, Link2, ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react-native";

export default function SocialIdentityScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [existingSocials, setExistingSocials] = useState<SocialMediaHandle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSocials = async () => {
      if (!user?.accountId) return;
      try {
        const response = await userService.getSocials(user.accountId);
        if (response.success && response.data?.socials) {
          setExistingSocials(response.data.socials);
          response.data.socials.forEach((s) => {
            if (s.platform === "LinkedIn") setLinkedin(s.handleOrUrl);
            if (s.platform === "Instagram") setInstagram(s.handleOrUrl);
            if (s.platform === "Facebook") setFacebook(s.handleOrUrl);
          });
        }
      } catch (err: any) {
        console.warn("Failed to fetch socials:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSocials();
  }, [user?.accountId]);

  // Count non-empty handles
  const activeCount = [linkedin, instagram, facebook].filter((h) => h.trim().length > 0).length;
  const isGateSatisfied = activeCount >= 2;

  const handleContinue = async () => {
    if (!isGateSatisfied) {
      setError("At least 2 social media profiles (LinkedIn, Instagram, or Facebook) are required to verify your identity.");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      if (user?.accountId) {
        // Synchronize socials
        const promises = [];
        if (linkedin.trim()) {
          promises.push(userService.addSocial(user.accountId, "LinkedIn", linkedin.trim()));
        }
        if (instagram.trim()) {
          promises.push(userService.addSocial(user.accountId, "Instagram", instagram.trim()));
        }
        if (facebook.trim()) {
          promises.push(userService.addSocial(user.accountId, "Facebook", facebook.trim()));
        }
        await Promise.all(promises);
      }
      router.push("/(onboarding)/media-upload" as any);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save social profiles.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenWrapper
      title="Identity Verification"
      subtitle="Step 4 of 7"
      showBack={true}
    >
      <ProgressBar currentStep={4} totalSteps={7} label="Step 4: Socials" />

      <Text className="text-2xl font-black text-slate-900 mb-1">
        Social Footprint Verification
      </Text>
      <Text className="text-sm text-slate-500 mb-4">
        To maintain a verified, high-trust community, provide at least 2 of the 3 major social profiles.
      </Text>

      {/* 2-of-3 Status Card */}
      <Card
        className={`mb-6 border-2 transition-all ${
          isGateSatisfied
            ? "border-green-300 bg-green-50/40"
            : "border-amber-300 bg-amber-50/40"
        }`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 mr-2">
            {isGateSatisfied ? (
              <CheckCircle2 size={22} color="#16A34A" />
            ) : (
              <AlertTriangle size={22} color="#D97706" />
            )}
            <View className="ml-2.5 flex-1">
              <Text
                className={`text-sm font-bold ${
                  isGateSatisfied ? "text-green-900" : "text-amber-900"
                }`}
              >
                {isGateSatisfied
                  ? "Identity Verification Gate: Satisfied"
                  : "Minimum 2 Handles Required"}
              </Text>
              <Text
                className={`text-xs mt-0.5 ${
                  isGateSatisfied ? "text-green-700" : "text-amber-700"
                }`}
              >
                {activeCount} of 3 profiles connected
              </Text>
            </View>
          </View>
          <Badge
            label={isGateSatisfied ? "Verified" : `${activeCount}/2 Added`}
            variant={isGateSatisfied ? "success" : "warning"}
          />
        </View>
      </Card>

      {isLoading ? (
        <View className="py-10 items-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <View className="gap-2">
          {/* LinkedIn Handle */}
          <Input
            label="LinkedIn Profile"
            placeholder="linkedin.com/in/username or @username"
            leftIcon={<Globe size={18} color="#0A66C2" />}
            value={linkedin}
            onChangeText={(text) => {
              setLinkedin(text);
              setError("");
            }}
          />

          {/* Instagram Handle */}
          <Input
            label="Instagram Handle"
            placeholder="@your_handle"
            leftIcon={<Share2 size={18} color="#E1306C" />}
            value={instagram}
            onChangeText={(text) => {
              setInstagram(text);
              setError("");
            }}
          />

          {/* Facebook Handle */}
          <Input
            label="Facebook Profile"
            placeholder="facebook.com/username or profile URL"
            leftIcon={<Link2 size={18} color="#1877F2" />}
            value={facebook}
            onChangeText={(text) => {
              setFacebook(text);
              setError("");
            }}
          />

          {error ? (
            <Text className="mt-2 text-xs font-bold text-red-500">{error}</Text>
          ) : null}

          <Button
            title="Continue to Photos & Video"
            disabled={!isGateSatisfied}
            isLoading={isSaving}
            onPress={handleContinue}
            className="mt-6 mb-8"
          />
        </View>
      )}
    </ScreenWrapper>
  );
}
