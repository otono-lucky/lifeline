// app/(app)/(tabs)/requests.tsx
// Phase 6: 3-Slot Match Request Management (Sent & Received, Blind Rejection, First-Come Acceptance)

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";
import SlotCounter from "../../../components/ui/SlotCounter";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Avatar from "../../../components/ui/Avatar";
import requestService from "../../../services/requestService";
import { MatchRequest } from "../../../types";
import {
  Send,
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Info,
} from "lucide-react-native";

export default function RequestsScreen() {
  const router = useRouter();

  const [tab, setTab] = useState<"sent" | "received">("received");
  const [sentRequests, setSentRequests] = useState<MatchRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<MatchRequest[]>([]);
  const [usedSlots, setUsedSlots] = useState(0);
  const [totalSlots, setTotalSlots] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      const [sentRes, receivedRes] = await Promise.all([
        requestService.getSentRequests(),
        requestService.getReceivedRequests(),
      ]);

      if (sentRes.success && sentRes.data) {
        setSentRequests(sentRes.data.requests || []);
        setUsedSlots(sentRes.data.slotsUsed ?? 0);
        setTotalSlots(3);
      }
      if (receivedRes.success && receivedRes.data) {
        setReceivedRequests(receivedRes.data.requests || []);
      }
    } catch (err: any) {
      console.warn("Failed to load requests:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // First-Come Acceptance (auto-supersedes other requests & provisions channels)
  const handleAccept = async (request: MatchRequest) => {
    setProcessingId(request.id);
    try {
      const response = await requestService.acceptRequest(request.id);
      if (response.success) {
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
        loadRequests();
      }
    } catch (err: any) {
      Alert.alert("Acceptance Error", err.message || "Failed to accept request.");
    } finally {
      setProcessingId(null);
    }
  };

  // Blind Rejection (sender notified generically of reclaimed slot)
  const handleDecline = async (request: MatchRequest) => {
    setProcessingId(request.id);
    try {
      const response = await requestService.declineRequest(request.id);
      if (response.success) {
        Alert.alert("Request Declined", "The request was declined discreetly.");
        loadRequests();
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to decline request.");
    } finally {
      setProcessingId(null);
    }
  };

  // Cancel Sent Request to reclaim slot
  const handleCancel = async (request: MatchRequest) => {
    setProcessingId(request.id);
    try {
      const response = await requestService.cancelRequest(request.id);
      if (response.success) {
        Alert.alert("Request Cancelled", "Your match request slot has been reclaimed.");
        loadRequests();
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to cancel request.");
    } finally {
      setProcessingId(null);
    }
  };

  const activeList = tab === "sent" ? sentRequests : receivedRequests;

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
            Sent ({sentRequests.length}/3)
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : activeList.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6 text-center">
          <View className="mb-4 rounded-full bg-slate-100 p-6">
            <Clock size={36} color="#64748B" />
          </View>
          <Text className="text-lg font-bold text-slate-800 text-center mb-1">
            {tab === "sent" ? "No Sent Requests" : "No Pending Requests"}
          </Text>
          <Text className="text-xs text-slate-500 text-center max-w-xs">
            {tab === "sent"
              ? "You have all 3 request slots available to connect with believers."
              : "Incoming match requests from verified believers will appear here."}
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                setIsRefreshing(true);
                loadRequests();
              }}
            />
          }
        >
          <View className="gap-3 pb-8">
            {activeList.map((req) => {
              const profile = tab === "sent" ? req.receiver : req.sender;
              const name = profile?.firstName || (tab === "sent" ? "Recipient" : "Sender");
              const photo = profile?.photos?.[0]?.photoUrl;

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
                        isLoading={processingId === req.id}
                        onPress={() => handleDecline(req)}
                        className="flex-1"
                      />
                      <Button
                        title="Accept (First-Come)"
                        variant="primary"
                        size="sm"
                        isLoading={processingId === req.id}
                        onPress={() => handleAccept(req)}
                        className="flex-1"
                      />
                    </View>
                  ) : tab === "sent" && req.status === "PENDING" ? (
                    <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-slate-100">
                      <Text className="text-xs text-slate-500">
                        Slot active • Awaiting response
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleCancel(req)}
                        disabled={processingId === req.id}
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
