// app/(app)/(tabs)/requests.tsx
// Phase 6: 3-Slot Match Request Management with TanStack Query & Strict Blind Rejection

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";
import SlotCounter from "../../../components/ui/SlotCounter";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Avatar from "../../../components/ui/Avatar";
import StateView from "../../../components/ui/StateView";
import requestService from "../../../services/requestService";
import { MatchRequest } from "../../../types";
import {
  Send,
  Inbox,
  Clock,
} from "lucide-react-native";

export default function RequestsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"sent" | "received">("received");

  // 1. Query for Sent Requests
  const sentQuery = useQuery({
    queryKey: ["sentRequests"],
    queryFn: async () => {
      const res = await requestService.getSentRequests();
      return res.data;
    },
  });

  // 2. Query for Received Requests
  const receivedQuery = useQuery({
    queryKey: ["receivedRequests"],
    queryFn: async () => {
      const res = await requestService.getReceivedRequests();
      return res.data?.requests || [];
    },
  });

  // 3. Mutations
  const acceptMutation = useMutation({
    mutationFn: (requestId: string) => requestService.acceptRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sentRequests"] });
      queryClient.invalidateQueries({ queryKey: ["receivedRequests"] });
      Alert.alert(
        "Match Accepted! 🎉",
        "Private encrypted couple chat and 4-party counselor guidance channels have been initialized.",
        [
          {
            text: "Open Conversations",
            onPress: () => router.push("/(app)/(tabs)/messages" as any),
          },
        ],
      );
    },
    onError: (err: any) => {
      Alert.alert("Acceptance Error", err.message || "Failed to accept request.");
    },
  });

  const declineMutation = useMutation({
    mutationFn: (requestId: string) => requestService.declineRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sentRequests"] });
      queryClient.invalidateQueries({ queryKey: ["receivedRequests"] });
      Alert.alert("Request Declined", "The request was declined discreetly.");
    },
    onError: (err: any) => {
      Alert.alert("Error", err.message || "Failed to decline request.");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (requestId: string) => requestService.cancelRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sentRequests"] });
      queryClient.invalidateQueries({ queryKey: ["receivedRequests"] });
      Alert.alert("Request Cancelled", "Your match request slot has been reclaimed.");
    },
    onError: (err: any) => {
      Alert.alert("Error", err.message || "Failed to cancel request.");
    },
  });

  // Strict Blind Rejection filter: Only show active pending (or accepted) requests in Sent tab
  const allSent = sentQuery.data?.requests || [];
  const activeSentRequests = allSent.filter(
    (req) => req.status === "PENDING" || req.status === "ACCEPTED",
  );
  const receivedRequests = receivedQuery.data || [];
  const usedSlots = sentQuery.data?.slotsUsed ?? activeSentRequests.length;
  const totalSlots = 3;

  const activeList = tab === "sent" ? activeSentRequests : receivedRequests;
  const isLoading = sentQuery.isLoading || receivedQuery.isLoading;
  const isError = sentQuery.isError || receivedQuery.isError;
  const isRefreshing = sentQuery.isRefetching || receivedQuery.isRefetching;

  const handleRefresh = () => {
    sentQuery.refetch();
    receivedQuery.refetch();
  };

  return (
    <ScreenWrapper
      title="Match Requests"
      subtitle="Psychological safety with 3-slot cap & blind rejection"
      isScrollable={false}
    >
      {/* 3-Slot Request Indicator */}
      <View className="mb-4">
        <SlotCounter usedSlots={usedSlots} totalSlots={totalSlots} />
      </View>

      {/* Segmented Control Tabs */}
      <View className="flex-row rounded-2xl bg-slate-200 p-1 mb-4">
        <TouchableOpacity
          onPress={() => setTab("received")}
          className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl transition-all ${
            tab === "received" ? "bg-white shadow-sm" : ""
          }`}
        >
          <Inbox
            size={16}
            color={tab === "received" ? "#2563EB" : "#64748B"}
          />
          <Text
            className={`ml-2 text-xs font-bold ${
              tab === "received" ? "text-blue-600" : "text-slate-600"
            }`}
          >
            Received ({receivedRequests.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTab("sent")}
          className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl transition-all ${
            tab === "sent" ? "bg-white shadow-sm" : ""
          }`}
        >
          <Send
            size={16}
            color={tab === "sent" ? "#2563EB" : "#64748B"}
          />
          <Text
            className={`ml-2 text-xs font-bold ${
              tab === "sent" ? "text-blue-600" : "text-slate-600"
            }`}
          >
            Sent ({activeSentRequests.length}/3)
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <StateView
          type="loading"
          title="Loading Requests..."
          message="Fetching active match requests and slots."
        />
      ) : isError ? (
        <StateView
          type="error"
          title="Unable to Load Requests"
          message="Could not load your match requests. Please check your network connection."
          onRetry={handleRefresh}
        />
      ) : activeList.length === 0 ? (
        <StateView
          type="empty"
          icon={<Clock size={36} color="#64748B" />}
          title={tab === "sent" ? "No Sent Requests" : "No Pending Requests"}
          message={
            tab === "sent"
              ? "You have all 3 request slots available to connect with believers."
              : "Incoming match requests from verified believers will appear here."
          }
          actionTitle="Refresh"
          onAction={handleRefresh}
        />
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
        >
          <View className="gap-3 pb-8">
            {activeList.map((req) => {
              const profile = tab === "sent" ? req.receiver : req.sender;
              const name = profile?.firstName || (tab === "sent" ? "Recipient" : "Sender");
              const photo = profile?.photos?.[0]?.photoUrl;
              const isMutating =
                (acceptMutation.isPending && acceptMutation.variables === req.id) ||
                (declineMutation.isPending && declineMutation.variables === req.id) ||
                (cancelMutation.isPending && cancelMutation.variables === req.id);

              return (
                <Card
                  key={req.id}
                  className="border border-slate-200 p-4 shadow-sm"
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center flex-1 mr-2">
                      <Avatar url={photo} name={name} size="md" isVerified />
                      <View className="ml-3 flex-1">
                        <Text className="text-base font-bold text-slate-900">
                          {name}
                        </Text>
                        <Text className="text-xs text-slate-500" numberOfLines={1}>
                          {profile?.churchName || "Christian Believer"}
                        </Text>
                      </View>
                    </View>

                    <Badge
                      label={req.status}
                      variant={
                        req.status === "ACCEPTED"
                          ? "success"
                          : req.status === "PENDING"
                          ? "warning"
                          : "neutral"
                      }
                    />
                  </View>

                  {/* Actions depending on Sent vs Received */}
                  {tab === "received" && req.status === "PENDING" ? (
                    <View className="flex-row gap-3 mt-2">
                      <Button
                        title="Decline"
                        variant="secondary"
                        size="sm"
                        isLoading={isMutating}
                        onPress={() => declineMutation.mutate(req.id)}
                        className="flex-1"
                      />
                      <Button
                        title="Accept (First-Come)"
                        variant="primary"
                        size="sm"
                        isLoading={isMutating}
                        onPress={() => acceptMutation.mutate(req.id)}
                        className="flex-1"
                      />
                    </View>
                  ) : tab === "sent" && req.status === "PENDING" ? (
                    <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-slate-100">
                      <Text className="text-xs text-slate-500">
                        Slot active • Awaiting response
                      </Text>
                      <TouchableOpacity
                        onPress={() => cancelMutation.mutate(req.id)}
                        disabled={isMutating}
                        className="px-3 py-1.5 rounded-xl bg-slate-100"
                      >
                        <Text className="text-xs font-bold text-red-600">
                          Cancel (Reclaim Slot)
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </Card>
              );
            })}
          </View>
        </ScrollView>
      )}
    </ScreenWrapper>
  );
}
