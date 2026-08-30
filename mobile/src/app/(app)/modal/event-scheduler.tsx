// app/(app)/modal/event-scheduler.tsx
// Phase 7: Dynamic Calendar Meeting Proposal Modal

import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import communicationService from "../../../services/communicationService";
import { Calendar, Clock, Video, Send } from "lucide-react-native";

export default function EventSchedulerModal() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const router = useRouter();

  const [title, setTitle] = useState("First Faith & Intentionality Call");
  const [description, setDescription] = useState("Getting to know each other over structured video conversation.");
  const [date, setDate] = useState("2026-09-01");
  const [time, setTime] = useState("19:00");
  const [meetingLink, setMeetingLink] = useState("https://meet.google.com/lifeline-session");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePropose = async () => {
    if (!title.trim() || !date.trim() || !time.trim()) {
      Alert.alert("Required Fields", "Please specify title, date, and time.");
      return;
    }

    setIsSubmitting(true);
    try {
      const startTime = new Date(`${date}T${time}:00Z`).toISOString();
      const endTime = new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString();

      await communicationService.proposeEvent(matchId || "active_match", {
        title: title.trim(),
        description: description.trim(),
        startTime,
        endTime,
        meetingLink: meetingLink.trim(),
      });

      Alert.alert(
        "Proposal Sent! 📅",
        "The meeting has been proposed to your match. Once confirmed, it will auto-add to both of your calendars.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (err: any) {
      Alert.alert("Proposal Error", err.message || "Failed to propose calendar event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenWrapper
      title="Propose Meeting"
      subtitle="Dynamic in-app calendar scheduling"
      showBack={true}
      onBack={() => router.back()}
      isScrollable={true}
    >
      <Card className="mb-6 bg-blue-50/60 border border-blue-200">
        <Text className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">
          Auto-Add State Machine
        </Text>
        <Text className="text-xs text-blue-800 leading-relaxed">
          Once the recipient accepts this proposed time, the appointment is automatically synced into both participants' calendar tabs.
        </Text>
      </Card>

      <Input
        label="Meeting Title"
        placeholder="e.g. Pastoral Check-In or Video Call"
        value={title}
        onChangeText={setTitle}
      />

      <Input
        label="Date (YYYY-MM-DD)"
        placeholder="2026-09-01"
        leftIcon={<Calendar size={18} color="#64748B" />}
        value={date}
        onChangeText={setDate}
      />

      <Input
        label="Time (HH:MM)"
        placeholder="19:00"
        leftIcon={<Clock size={18} color="#64748B" />}
        value={time}
        onChangeText={setTime}
      />

      <Input
        label="Video / Meeting Link (Optional)"
        placeholder="https://..."
        leftIcon={<Video size={18} color="#64748B" />}
        value={meetingLink}
        onChangeText={setMeetingLink}
      />

      <Input
        label="Agenda / Notes"
        placeholder="Optional agenda notes..."
        multiline
        numberOfLines={3}
        value={description}
        onChangeText={setDescription}
      />

      <Button
        title="Send Meeting Proposal"
        rightIcon={<Send size={18} color="#FFFFFF" />}
        isLoading={isSubmitting}
        onPress={handlePropose}
        className="mt-4 mb-8"
      />
    </ScreenWrapper>
  );
}
