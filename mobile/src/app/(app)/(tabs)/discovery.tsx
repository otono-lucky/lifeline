// app/(app)/(tabs)/discovery.tsx
// Phase 6: Geo-Weighted Discovery Feed with TanStack Query & 3-Slot "Shame-Free" Request Logic

import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";
import SlotCounter from "../../../components/ui/SlotCounter";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import StateView from "../../../components/ui/StateView";
import discoveryService from "../../../services/discoveryService";
import requestService from "../../../services/requestService";
import { CandidateProfile } from "../../../types";
import {
  MapPin,
  Church,
  Send,
  Video,
  Info,
  Sparkles,
} from "lucide-react-native";

export default function DiscoveryScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 1. TanStack Query for Discovery Feed
  const feedQuery = useQuery({
    queryKey: ["discoveryFeed"],
    queryFn: async () => {
      const res = await discoveryService.getFeed();
      return res.data?.candidates || [];
    },
  });

  // 2. TanStack Query for Sent Requests & Slot Availability
  const requestsQuery = useQuery({
    queryKey: ["sentRequests"],
    queryFn: async () => {
      const res = await requestService.getSentRequests();
      return res.data;
    },
  });

  // 3. Mutation to send match request
  const sendRequestMutation = useMutation({
    mutationFn: async (targetId: string) => {
      return await requestService.sendRequest(targetId);
    },
    onSuccess: (_, targetId) => {
      queryClient.invalidateQueries({ queryKey: ["discoveryFeed"] });
      queryClient.invalidateQueries({ queryKey: ["sentRequests"] });
      Alert.alert(
        "Request Sent! 🎉",
        "Match request sent. If accepted, your private couple chat and counselor guidance channels will initialize automatically.",
      );
    },
    onError: (err: any) => {
      Alert.alert("Request Error", err.message || "Failed to send request.");
    },
  });

  const candidates = feedQuery.data || [];
  const usedSlots = requestsQuery.data?.slotsUsed ?? 0;
  const totalSlots = 3;
  const isRefreshing = feedQuery.isRefetching || requestsQuery.isRefetching;

  const handleRefresh = () => {
    feedQuery.refetch();
    requestsQuery.refetch();
  };

  const handleSendRequest = (candidate: CandidateProfile) => {
    if (usedSlots >= totalSlots) {
      Alert.alert(
        "Slots Full",
        "You currently have 3 active match requests. Once a recipient responds or you cancel a request, a slot will open automatically.",
      );
      return;
    }
    sendRequestMutation.mutate(candidate.accountId || candidate.id);
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

      {feedQuery.isLoading ? (
        <StateView
          type="loading"
          title="Finding Matches..."
          message="Searching for verified believers matching your church and geographic scope."
        />
      ) : feedQuery.isError ? (
        <StateView
          type="error"
          title="Unable to Load Discovery Feed"
          message={feedQuery.error instanceof Error ? feedQuery.error.message : "Failed to fetch candidates."}
          onRetry={handleRefresh}
        />
      ) : candidates.length === 0 ? (
        <StateView
          type="empty"
          icon={<Sparkles size={40} color="#2563EB" />}
          title="No Candidates Found"
          message="We are continuously vetting believers from local and sister parishes. Check back soon!"
          actionTitle="Refresh Feed"
          onAction={handleRefresh}
        />
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        >
          <View className="gap-5 pb-8">
            {candidates.map((candidate) => {
              const primaryPhoto =
                candidate.photos?.[0]?.photoUrl ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600";
              const isSending =
                sendRequestMutation.isPending &&
                sendRequestMutation.variables === (candidate.accountId || candidate.id);

              return (
                <Card
                  key={candidate.id}
                  className="p-0 overflow-hidden border border-slate-200 shadow-md"
                >
                  {/* Photo Hero Banner */}
                  <TouchableOpacity
                    onPress={() =>
                      router.push(`/(app)/candidate/${candidate.accountId || candidate.id}` as any)
                    }
                    activeOpacity={0.9}
                    className="h-80 w-full relative bg-slate-900"
                  >
                    <Image
                      source={{ uri: primaryPhoto }}
                      className="h-full w-full object-cover"
                    />

                    {/* Gradient Overlay */}
                    <View className="absolute inset-0 bg-black/35" />

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
                        {candidate.firstName}
                        {candidate.age ? `, ${candidate.age}` : ""}
                      </Text>

                      <View className="flex-row items-center mt-1">
                        <Church size={14} color="#93C5FD" />
                        <Text
                          className="ml-1.5 text-xs font-semibold text-blue-200"
                          numberOfLines={1}
                        >
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
                        onPress={() =>
                          router.push(
                            `/(app)/candidate/${candidate.accountId || candidate.id}` as any,
                          )
                        }
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 items-center justify-center"
                      >
                        <Info size={20} color="#64748B" />
                      </TouchableOpacity>

                      <Button
                        title="Send Match Request"
                        rightIcon={<Send size={16} color="#FFFFFF" />}
                        disabled={usedSlots >= totalSlots}
                        isLoading={isSending}
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
