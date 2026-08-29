// app/(app)/candidate/[userId].tsx
// Phase 6: Candidate Profile Detail Modal & Request Trigger

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import discoveryService from "../../../services/discoveryService";
import requestService from "../../../services/requestService";
import { CandidateProfile } from "../../../types";
import {
  Church,
  MapPin,
  Briefcase,
  Video,
  Send,
  ShieldCheck,
  CheckCircle,
} from "lucide-react-native";

export default function CandidateDetailModal() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();

  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchCandidate = async () => {
      if (!userId) return;
      try {
        const response = await discoveryService.getCandidateDetails(userId);
        if (response.success && response.data?.candidate) {
          setCandidate(response.data.candidate);
        }
      } catch (err: any) {
        console.warn("Failed to fetch candidate details:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCandidate();
  }, [userId]);

  const handleSendRequest = async () => {
    if (!candidate) return;
    setIsSending(true);
    try {
      const response = await requestService.sendRequest(candidate.accountId || candidate.id);
      if (response.success) {
        Alert.alert(
          "Request Sent!",
          `Match request dispatched to ${candidate.firstName}.`,
          [{ text: "OK", onPress: () => router.back() }],
        );
      }
    } catch (err: any) {
      Alert.alert("Request Error", err.message || "Failed to send match request.");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <ScreenWrapper title="Profile" showBack={true}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </ScreenWrapper>
    );
  }

  if (!candidate) {
    return (
      <ScreenWrapper title="Profile" showBack={true}>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-base text-slate-500">Candidate not found</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const photos = candidate.photos?.length
    ? candidate.photos.map((p) => p.photoUrl)
    : ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600"];

  return (
    <ScreenWrapper
      title={`${candidate.firstName}'s Profile`}
      showBack={true}
      isScrollable={true}
    >
      {/* Main Selected Photo */}
      <View className="rounded-3xl overflow-hidden mb-3 bg-slate-900 aspect-[4/5] relative">
        <Image
          source={{ uri: photos[selectedPhotoIndex] }}
          className="w-full h-full object-cover"
        />
        <View className="absolute top-4 left-4">
          <Badge label="100% Vetted" variant="success" />
        </View>
      </View>

      {/* 3 Photos Thumbnail Row */}
      {photos.length > 1 && (
        <View className="flex-row gap-3 mb-6">
          {photos.map((url, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => setSelectedPhotoIndex(idx)}
              className={`flex-1 aspect-[4/3] rounded-xl overflow-hidden border-2 ${
                selectedPhotoIndex === idx ? "border-blue-600" : "border-transparent"
              }`}
            >
              <Image source={{ uri: url }} className="w-full h-full object-cover" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Header Info */}
      <View className="mb-6">
        <Text className="text-2xl font-black text-slate-900">
          {candidate.firstName}{candidate.age ? `, ${candidate.age}` : ""}
        </Text>

        <View className="flex-row items-center mt-1">
          <Church size={16} color="#2563EB" />
          <Text className="ml-2 text-sm font-semibold text-slate-800">
            {candidate.churchName || "Christian Church"}
            {candidate.branchName ? ` • ${candidate.branchName}` : ""}
          </Text>
        </View>

        <View className="flex-row items-center mt-1">
          <MapPin size={16} color="#64748B" />
          <Text className="ml-2 text-sm text-slate-500">
            {candidate.residenceCity || "City"}, {candidate.residenceState || "State"}
            {candidate.distanceKm !== undefined ? ` (${Math.round(candidate.distanceKm)} km away)` : ""}
          </Text>
        </View>

        {candidate.occupation ? (
          <View className="flex-row items-center mt-1">
            <Briefcase size={16} color="#64748B" />
            <Text className="ml-2 text-sm text-slate-700">
              {candidate.occupation}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Video Intro Badge */}
      {candidate.videoIntroUrl && (
        <Card className="mb-6 bg-blue-50/50 border border-blue-200">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="mr-3 rounded-xl bg-blue-600 p-2.5">
                <Video size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text className="text-sm font-bold text-slate-900">
                  Introductory Video Available
                </Text>
                <Text className="text-xs text-slate-500">
                  Liveness identity confirmed by pastoral counselor
                </Text>
              </View>
            </View>
            <CheckCircle size={20} color="#16A34A" />
          </View>
        </Card>
      )}

      {/* Send Request CTA */}
      <Button
        title="Send Match Request (Uses 1 Slot)"
        rightIcon={<Send size={18} color="#FFFFFF" />}
        isLoading={isSending}
        onPress={handleSendRequest}
        className="mb-8"
      />
    </ScreenWrapper>
  );
}
