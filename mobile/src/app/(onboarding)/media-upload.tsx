// app/(onboarding)/media-upload.tsx
// Phase 4: Step 5 Media Authenticity (Exactly 3 Profile Photos + <1 min Video Intro)

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import ProgressBar from "../../components/ui/ProgressBar";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import userService from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import { Camera, Video, Plus, CheckCircle, ShieldAlert } from "lucide-react-native";

export default function MediaUploadScreen() {
  const router = useRouter();
  const { user, updateLocalUser } = useAuth();

  // 3 Photo slots
  const [photos, setPhotos] = useState<string[]>([
    user?.photos?.[0]?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500",
    user?.photos?.[1]?.photoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
    user?.photos?.[2]?.photoUrl || "",
  ]);

  const [videoIntroUrl, setVideoIntroUrl] = useState(
    user?.videoIntroUrl || "https://assets.mixkit.co/videos/preview/mixkit-intro-sample.mp4",
  );
  const [videoDuration, setVideoDuration] = useState<number>(user?.videoDurationSeconds || 45);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const filledPhotosCount = photos.filter((p) => p.trim().length > 0).length;
  const isMediaComplete = filledPhotosCount === 3 && videoIntroUrl.trim().length > 0;

  const handleMockUploadPhoto = (index: number) => {
    const mockUrls = [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500",
    ];
    const newPhotos = [...photos];
    newPhotos[index] = mockUrls[index % mockUrls.length];
    setPhotos(newPhotos);
    setError("");
  };

  const handleContinue = async () => {
    if (filledPhotosCount < 3) {
      setError("Exactly 3 profile pictures are required to ensure authentic visual verification.");
      return;
    }
    if (!videoIntroUrl.trim()) {
      setError("An introductory video (under 1 minute) is required for liveness detection.");
      return;
    }
    if (videoDuration > 60) {
      setError("Introductory video duration must be under 60 seconds.");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      if (user?.accountId) {
        await userService.updateProfile(user.accountId, {
          videoIntroUrl: videoIntroUrl.trim(),
          videoDurationSeconds: videoDuration,
        } as any);

        updateLocalUser({
          videoIntroUrl: videoIntroUrl.trim(),
          videoDurationSeconds: videoDuration,
        });
      }
      router.push("/(onboarding)/preferences" as any);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save media.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenWrapper
      title="Photos & Video"
      subtitle="Step 5 of 7"
      showBack={true}
    >
      <ProgressBar currentStep={5} totalSteps={7} label="Step 5: Media" />

      <Text className="text-2xl font-black text-slate-900 mb-1">
        Authentic Media Footprint
      </Text>
      <Text className="text-sm text-slate-500 mb-4">
        To prevent deceptive imagery, Lifeline requires exactly 3 recent photos and a short video introduction.
      </Text>

      {/* 3 Photos Requirement Status */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-sm font-bold text-slate-800">
            Profile Photos ({filledPhotosCount}/3 Uploaded)
          </Text>
          <Badge
            label={filledPhotosCount === 3 ? "3 of 3 Added" : "3 Required"}
            variant={filledPhotosCount === 3 ? "success" : "warning"}
          />
        </View>

        {/* 3 Photo Slots Grid */}
        <View className="flex-row gap-3">
          {[0, 1, 2].map((index) => {
            const photoUrl = photos[index];
            const isUploaded = photoUrl && photoUrl.length > 0;

            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleMockUploadPhoto(index)}
                activeOpacity={0.8}
                className="flex-1 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 bg-slate-100 items-center justify-center relative"
              >
                {isUploaded ? (
                  <>
                    <Image
                      source={{ uri: photoUrl }}
                      className="w-full h-full object-cover"
                    />
                    <View className="absolute top-2 right-2 rounded-full bg-blue-600 p-1">
                      <CheckCircle size={14} color="#FFFFFF" />
                    </View>
                    <View className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2 py-0.5">
                      <Text className="text-[10px] font-bold text-white uppercase">
                        Slot {index + 1}
                      </Text>
                    </View>
                  </>
                ) : (
                  <View className="items-center p-2 text-center">
                    <View className="rounded-full bg-white p-3 shadow-sm mb-2">
                      <Plus size={20} color="#2563EB" />
                    </View>
                    <Text className="text-xs font-bold text-slate-600 text-center">
                      Upload #{index + 1}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Liveness Detection Video Section */}
      <View className="mb-6">
        <Text className="text-sm font-bold text-slate-800 mb-1">
          Introductory Video (Liveness Verification)
        </Text>
        <Text className="text-xs text-slate-500 mb-3">
          A short video (under 1 minute) sharing your testimony or greeting to prospective matches.
        </Text>

        <Card className="bg-slate-50 border border-slate-200">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center flex-1">
              <View className="mr-3 rounded-2xl bg-blue-100 p-2.5">
                <Video size={20} color="#2563EB" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-slate-900" numberOfLines={1}>
                  intro_video_vetted.mp4
                </Text>
                <Text className="text-xs text-slate-500">
                  Duration: {videoDuration} seconds (Max: 60s)
                </Text>
              </View>
            </View>
            <Badge label="Valid < 60s" variant="success" />
          </View>

          <Input
            label="Video URL / Cloudinary Stream"
            value={videoIntroUrl}
            onChangeText={(text) => setVideoIntroUrl(text)}
            placeholder="https://..."
          />
        </Card>
      </View>

      {error ? (
        <Text className="mb-4 text-xs font-bold text-red-500">{error}</Text>
      ) : null}

      <Button
        title="Continue to Match Scope"
        disabled={!isMediaComplete}
        isLoading={isSaving}
        onPress={handleContinue}
        className="mb-8"
      />
    </ScreenWrapper>
  );
}
