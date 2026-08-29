// app/(app)/(tabs)/discovery.tsx
// Phase 6: Geo-Weighted Discovery Feed with 3-Slot "Shame-Free" Request Logic

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";
import SlotCounter from "../../../components/ui/SlotCounter";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import discoveryService from "../../../services/discoveryService";
import requestService from "../../../services/requestService";
import { CandidateProfile } from "../../../types";
import {
  Sparkles,
  MapPin,
  Church,
  Send,
  Heart,
  UserCheck,
  Video,
  Info,
} from "lucide-react-native";

export default function DiscoveryScreen() {
  const router = useRouter();

  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [usedSlots, setUsedSlots] = useState(0);
  const [totalSlots, setTotalSlots] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [feedRes, requestsRes] = await Promise.all([
        discoveryService.getFeed(),
        requestService.getSentRequests(),
      ]);

      if (feedRes.success && feedRes.data?.candidates) {
        setCandidates(feedRes.data.candidates);
      }
      if (requestsRes.success && requestsRes.data) {
        setUsedSlots(requestsRes.data.slotsUsed ?? 0);
        setTotalSlots(3);
      }
    } catch (err: any) {
      console.warn("Failed to load discovery feed:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSendRequest = async (candidate: CandidateProfile) => {
    if (usedSlots >= totalSlots) {
      Alert.alert(
        "Slots Full",
        "You currently have 3 active match requests. Once a recipient responds or you cancel a request, a slot will open automatically.",
      );
      return;
    }

    setSendingId(candidate.id);
    try {
      const response = await requestService.sendRequest(candidate.accountId || candidate.id);
      if (response.success) {
        setUsedSlots((prev) => prev + 1);
        Alert.alert(
          "Request Sent!",
          `Match request sent to ${candidate.firstName}. If accepted, your private and counselor channels will initialize automatically.`,
        );
      }
    } catch (err: any) {
      Alert.alert("Request Error", err.message || "Failed to send request.");
    } finally {
      setSendingId(null);
    }
  };

  return (
    <ScreenWrapper
      title="Discovery Feed"
      subtitle="Verified marriage-minded Christian believers"
      isScrollable={false}
    >
      {/* 3-Slot Request Visualizer */}
      <View className="mb-4">
        <SlotCounter usedSlots={usedSlots} totalSlots={totalSlots} />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="mt-3 text-sm font-medium text-slate-500">
            Finding compatible candidates...
          </Text>
        </View>
      ) : candidates.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6 text-center">
          <View className="mb-4 rounded-full bg-blue-50 p-6">
            <Sparkles size={40} color="#2563EB" />
          </View>
          <Text className="text-xl font-bold text-slate-900 text-center mb-2">
            No New Candidates
          </Text>
          <Text className="text-sm text-slate-500 text-center mb-6 max-w-xs">
            We are continuously verifying new believers. Check back soon or broaden your search scope.
          </Text>
          <Button title="Refresh Feed" onPress={loadData} />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); loadData(); }} />
          }
        >
          <View className="gap-5 pb-8">
            {candidates.map((candidate) => {
              const primaryPhoto =
                candidate.photos?.[0]?.photoUrl ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600";

              return (
                <Card
                  key={candidate.id}
                  className="p-0 overflow-hidden border border-slate-200 shadow-md"
                >
                  {/* Photo Hero Banner */}
                  <TouchableOpacity
                    onPress={() => router.push(`/(app)/candidate/${candidate.accountId || candidate.id}` as any)}
                    activeOpacity={0.9}
                    className="h-80 w-full relative bg-slate-900"
                  >
                    <Image
                      source={{ uri: primaryPhoto }}
                      className="h-full w-full object-cover"
                    />

                    {/* Gradient Overlay */}
                    <View className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Top Badges */}
                    <View className="absolute top-4 left-4 right-4 flex-row items-center justify-between">
                      <View className="flex-row gap-2">
                        {candidate.isSameChurch ? (
                          <Badge label="Home Church" variant="primary" />
                        ) : (
                          <Badge label="Sister Church" variant="purple" />
                        )}
                        {candidate.distanceKm !== undefined && (
                          <Badge
                            label={`${Math.round(candidate.distanceKm)} km away`}
                            variant="neutral"
                          />
                        )}
                      </View>

                      {candidate.videoIntroUrl ? (
                        <View className="rounded-full bg-black/60 p-2 border border-white/30">
                          <Video size={16} color="#FFFFFF" />
                        </View>
                      ) : null}
                    </View>

                    {/* Bottom Info on Image */}
                    <View className="absolute bottom-4 left-4 right-4">
                      <Text className="text-2xl font-black text-white">
                        {candidate.firstName}{candidate.age ? `, ${candidate.age}` : ""}
                      </Text>

                      <View className="flex-row items-center mt-1">
                        <Church size={14} color="#93C5FD" />
                        <Text className="ml-1.5 text-xs font-semibold text-blue-200" numberOfLines={1}>
                          {candidate.churchName || "Christian Believer"}
                          {candidate.branchName ? ` • ${candidate.branchName}` : ""}
                        </Text>
                      </View>

                      <View className="flex-row items-center mt-1">
                        <MapPin size={14} color="#E2E8F0" />
                        <Text className="ml-1.5 text-xs text-slate-200">
                          {candidate.residenceCity || "City"}, {candidate.residenceState || "State"}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Body & Actions */}
                  <View className="p-4 bg-white">
                    {candidate.occupation ? (
                      <Text className="text-sm font-semibold text-slate-800 mb-3">
                        💼 {candidate.occupation}
                      </Text>
                    ) : null}

                    {/* Action Buttons */}
                    <View className="flex-row gap-3">
                      <TouchableOpacity
                        onPress={() => router.push(`/(app)/candidate/${candidate.accountId || candidate.id}` as any)}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 items-center justify-center"
                      >
                        <Info size={20} color="#64748B" />
                      </TouchableOpacity>

                      <Button
                        title="Send Match Request"
                        rightIcon={<Send size={16} color="#FFFFFF" />}
                        disabled={usedSlots >= totalSlots}
                        isLoading={sendingId === candidate.id}
                        onPress={() => handleSendRequest(candidate)}
                        className="flex-1"
                      />
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        </ScrollView>
      )}
    </ScreenWrapper>
  );
}
