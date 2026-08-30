// app/(app)/(tabs)/calendar.tsx
// Phase 7: Dynamic In-App Calendar (Auto-Add State Machine)

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { Calendar as CalendarIcon, Clock, Video, CheckCircle2, XCircle } from "lucide-react-native";

interface MockEvent {
  id: string;
  title: string;
  partnerName: string;
  date: string;
  time: string;
  status: "CONFIRMED" | "PROPOSED" | "CANCELLED";
  meetingLink?: string;
}

export default function CalendarScreen() {
  const [events, setEvents] = useState<MockEvent[]>([
    {
      id: "ev_1",
      title: "First Video Introduction Session",
      partnerName: "Grace Adebayo",
      date: "Tomorrow, Aug 29",
      time: "7:00 PM - 8:00 PM",
      status: "CONFIRMED",
      meetingLink: "https://meet.google.com/lifeline-session",
    },
    {
      id: "ev_2",
      title: "Pastor / Counselor Alignment Check-In",
      partnerName: "Pastor David (Counselor)",
      date: "Sunday, Aug 31",
      time: "4:00 PM - 4:45 PM",
      status: "PROPOSED",
      meetingLink: "https://meet.google.com/counselor-session",
    },
  ]);

  const handleConfirm = (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, status: "CONFIRMED" } : e)),
    );
    Alert.alert(
      "Meeting Confirmed! ✅",
      "The event has been confirmed and auto-added to your synchronized calendar.",
    );
  };

  const handleDecline = (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, status: "CANCELLED" } : e)),
    );
  };

  return (
    <ScreenWrapper
      title="Meeting Calendar"
      subtitle="Scheduled appointments and counselor check-ins"
      isScrollable={true}
    >
      <View className="gap-4 pb-8">
        {events.map((event) => {
          const isConfirmed = event.status === "CONFIRMED";
          const isProposed = event.status === "PROPOSED";

          return (
            <Card
              key={event.id}
              className="border border-slate-200 p-5 shadow-sm"
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1 mr-2">
                  <View
                    className={`mr-3 rounded-2xl p-3 ${
                      isConfirmed ? "bg-blue-600" : "bg-amber-100"
                    }`}
                  >
                    <CalendarIcon
                      size={20}
                      color={isConfirmed ? "#FFFFFF" : "#D97706"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-slate-900" numberOfLines={1}>
                      {event.title}
                    </Text>
                    <Text className="text-xs text-slate-500 mt-0.5">
                      With {event.partnerName}
                    </Text>
                  </View>
                </View>

                <Badge
                  label={event.status}
                  variant={isConfirmed ? "success" : isProposed ? "warning" : "neutral"}
                />
              </View>

              <View className="rounded-2xl bg-slate-50 p-3 mb-3 border border-slate-100">
                <View className="flex-row items-center mb-1.5">
                  <Clock size={14} color="#64748B" />
                  <Text className="ml-2 text-xs font-semibold text-slate-700">
                    {event.date} • {event.time}
                  </Text>
                </View>

                {event.meetingLink && (
                  <View className="flex-row items-center">
                    <Video size={14} color="#2563EB" />
                    <Text className="ml-2 text-xs text-blue-600 font-medium" numberOfLines={1}>
                      {event.meetingLink}
                    </Text>
                  </View>
                )}
              </View>

              {isProposed ? (
                <View className="flex-row gap-3">
                  <Button
                    title="Decline"
                    variant="secondary"
                    size="sm"
                    onPress={() => handleDecline(event.id)}
                    className="flex-1"
                  />
                  <Button
                    title="Confirm & Auto-Add"
                    variant="primary"
                    size="sm"
                    onPress={() => handleConfirm(event.id)}
                    className="flex-1"
                  />
                </View>
              ) : isConfirmed ? (
                <View className="flex-row items-center justify-between pt-1">
                  <Text className="text-xs text-green-700 font-semibold">
                    ✓ Synced to device calendar
                  </Text>
                  <TouchableOpacity
                    onPress={() => Alert.alert("Join Meeting", "Launching meeting link...")}
                    className="rounded-xl bg-blue-600 px-4 py-2"
                  >
                    <Text className="text-xs font-bold text-white">Join Call</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </Card>
          );
        })}
      </View>
    </ScreenWrapper>
  );
}
