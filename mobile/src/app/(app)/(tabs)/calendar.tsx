// app/(app)/(tabs)/calendar.tsx
// Phase 7: Dynamic In-App Calendar — wired to live backend API

import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  RefreshControl,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import StateView from "../../../components/ui/StateView";
import communicationService from "../../../services/communicationService";
import { CalendarEvent } from "../../../types";
import { Calendar as CalendarIcon, Clock, Video } from "lucide-react-native";

export default function CalendarScreen() {
  const queryClient = useQueryClient();

  // ─── Fetch real events ────────────────────────────────────────────────────
  const {
    data: events = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["calendarEvents"],
    queryFn: async () => {
      const response = await communicationService.getEvents();
      return (response.data as CalendarEvent[]) || [];
    },
    refetchInterval: 15000, // Poll every 15s
  });

  // ─── Confirm / Decline mutations ──────────────────────────────────────────
  const respondMutation = useMutation({
    mutationFn: async ({
      eventId,
      status,
    }: {
      eventId: string;
      status: "CONFIRMED" | "CANCELLED";
    }) => {
      return await communicationService.respondEvent(eventId, status);
    },
    onSuccess: (_, variables) => {
      // Optimistically update local cache
      queryClient.setQueryData<CalendarEvent[]>(["calendarEvents"], (old = []) =>
        old.map((e) =>
          e.id === variables.eventId ? { ...e, status: variables.status } : e,
        ),
      );
      if (variables.status === "CONFIRMED") {
        Alert.alert(
          "Meeting Confirmed! ✅",
          "The event has been confirmed and auto-added to your calendar.",
        );
      }
    },
    onError: (err: any) => {
      Alert.alert("Error", err.message || "Failed to respond to event.");
    },
  });

  const handleConfirm = (eventId: string) => {
    if (respondMutation.isPending) return;
    respondMutation.mutate({ eventId, status: "CONFIRMED" });
  };

  const handleDecline = (eventId: string) => {
    if (respondMutation.isPending) return;
    Alert.alert(
      "Decline Meeting",
      "Are you sure you want to decline this proposed meeting?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: () => respondMutation.mutate({ eventId, status: "CANCELLED" }),
        },
      ],
    );
  };

  const formatDateTimeRange = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const dateStr = start.toLocaleDateString("en-NG", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    const startStr = start.toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const endStr = end.toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dateStr} • ${startStr} – ${endStr}`;
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <ScreenWrapper
      title="Meeting Calendar"
      subtitle="Scheduled appointments and counselor check-ins"
      isScrollable={false}
    >
      {isLoading ? (
        <StateView
          type="loading"
          title="Loading Calendar..."
          message="Fetching your scheduled appointments."
        />
      ) : isError ? (
        <StateView
          type="error"
          title="Unable to Load Calendar"
          message={error instanceof Error ? error.message : "Failed to load events."}
          onRetry={refetch}
        />
      ) : events.length === 0 ? (
        <StateView
          type="empty"
          icon={<CalendarIcon size={40} color="#2563EB" />}
          title="No Scheduled Meetings"
          message="Once a meeting is proposed in your conversation, it will appear here for confirmation."
          actionTitle="Refresh"
          onAction={refetch}
        />
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        >
          <View className="gap-4 pb-8">
            {events.map((event: CalendarEvent) => {
              const isConfirmed = event.status === "CONFIRMED";
              const isProposed = event.status === "PROPOSED";
              const isCancelled = event.status === "CANCELLED";
              const isCompleted = event.status === "COMPLETED";
              // Only the non-proposer can confirm/decline a PROPOSED event
              const canRespond = isProposed && !event.proposedBy?.isMe;

              let badgeVariant: "success" | "warning" | "neutral" | "danger" = "neutral";
              if (isConfirmed || isCompleted) badgeVariant = "success";
              else if (isProposed) badgeVariant = "warning";
              else if (isCancelled) badgeVariant = "danger";

              return (
                <Card key={event.id} className="border border-slate-200 p-5 shadow-sm">
                  {/* Header */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center flex-1 mr-2">
                      <View
                        className={`mr-3 rounded-2xl p-3 ${
                          isConfirmed || isCompleted ? "bg-blue-600" : "bg-amber-100"
                        }`}
                      >
                        <CalendarIcon
                          size={20}
                          color={isConfirmed || isCompleted ? "#FFFFFF" : "#D97706"}
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-base font-bold text-slate-900"
                          numberOfLines={1}
                        >
                          {event.title}
                        </Text>
                        <Text className="text-xs text-slate-500 mt-0.5">
                          With {event.partnerName}
                        </Text>
                        {event.proposedBy && (
                          <Text className="text-xs text-slate-400 mt-0.5">
                            Proposed by {event.proposedBy.isMe ? "you" : event.proposedBy.name}
                          </Text>
                        )}
                      </View>
                    </View>
                    <Badge label={event.status} variant={badgeVariant} />
                  </View>

                  {/* Time & Link */}
                  <View className="rounded-2xl bg-slate-50 p-3 mb-3 border border-slate-100">
                    <View className="flex-row items-center mb-1.5">
                      <Clock size={14} color="#64748B" />
                      <Text className="ml-2 text-xs font-semibold text-slate-700">
                        {formatDateTimeRange(event.startTime, event.endTime)}
                      </Text>
                    </View>

                    {event.meetingLink && (
                      <View className="flex-row items-center">
                        <Video size={14} color="#2563EB" />
                        <Text
                          className="ml-2 text-xs text-blue-600 font-medium"
                          numberOfLines={1}
                        >
                          {event.meetingLink}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Actions */}
                  {canRespond && (
                    <View className="flex-row gap-3">
                      <Button
                        title="Decline"
                        variant="secondary"
                        size="sm"
                        onPress={() => handleDecline(event.id)}
                        className="flex-1"
                        disabled={respondMutation.isPending}
                      />
                      <Button
                        title="Confirm & Auto-Add"
                        variant="primary"
                        size="sm"
                        onPress={() => handleConfirm(event.id)}
                        className="flex-1"
                        disabled={respondMutation.isPending}
                      />
                    </View>
                  )}

                  {isProposed && event.proposedBy?.isMe && (
                    <Text className="text-xs text-amber-700 font-medium text-center pt-1">
                      ⏳ Awaiting partner confirmation
                    </Text>
                  )}

                  {(isConfirmed || isCompleted) && (
                    <View className="flex-row items-center justify-between pt-1">
                      <Text className="text-xs text-green-700 font-semibold">
                        ✓ Synced to calendar
                      </Text>
                      {event.meetingLink && (
                        <TouchableOpacity
                          onPress={() => {
                            if (event.meetingLink) Linking.openURL(event.meetingLink);
                          }}
                          className="rounded-xl bg-blue-600 px-4 py-2"
                        >
                          <Text className="text-xs font-bold text-white">Join Call</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        </ScrollView>
      )}
    </ScreenWrapper>
  );
}
