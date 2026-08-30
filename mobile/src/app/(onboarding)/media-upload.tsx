// app/(onboarding)/media-upload.tsx
// Phase 4: Step 5 Media Authenticity (Native Image Picker for 3 Profile Photos + <60s Video Intro)

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import ProgressBar from "../../components/ui/ProgressBar";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import userService from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import { Camera, Video, Plus, CheckCircle, Upload, Film } from "lucide-react-native";

export default function MediaUploadScreen() {
  const router = useRouter();
  const { user, updateLocalUser, refreshUser } = useAuth();

  // 3 Photo slots
  const [photos, setPhotos] = useState<string[]>([
    user?.photos?.[0]?.photoUrl || "",
    user?.photos?.[1]?.photoUrl || "",
    user?.photos?.[2]?.photoUrl || "",
  ]);

  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  const [videoIntroUrl, setVideoIntroUrl] = useState(
    user?.videoIntroUrl || "",
  );
  const [videoDuration, setVideoDuration] = useState<number>(
    user?.videoDurationSeconds || 30,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const filledPhotosCount = photos.filter((p) => p && p.trim().length > 0).length;
  const isMediaComplete = filledPhotosCount === 3 && (videoIntroUrl.trim().length > 0);

  const handlePickPhoto = async (index: number) => {
    setError("");
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please grant camera roll permissions to select your profile photos.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        const selectedUri = result.assets[0].uri;
        const newPhotos = [...photos];
        newPhotos[index] = selectedUri;
        setPhotos(newPhotos);

        // Upload immediately if user ID exists
        if (user?.accountId) {
          setUploadingSlot(index);
          try {
            await userService.uploadPhoto(user.accountId, selectedUri, index + 1);
          } catch (uploadErr: any) {
            console.warn(`[MediaUpload] Direct upload failed for slot ${index + 1}:`, uploadErr);
          } finally {
            setUploadingSlot(null);
          }
        }
      }
    } catch (err: any) {
      Alert.alert("Photo Selection Error", err.message || "Failed to pick image");
    }
  };

  const handlePickVideo = async () => {
    setError("");
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please grant media permissions to select your introduction video.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["videos"],
        allowsEditing: true,
        videoMaxDuration: 60,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const durationSec = Math.round((asset.duration || 30000) / 1000);

        if (durationSec > 60) {
          setError(`Video duration is ${durationSec}s. Lifeline strictly enforces <60s video intro.`);
          return;
        }

        setVideoIntroUrl(asset.uri);
        setVideoDuration(durationSec);
      }
    } catch (err: any) {
      Alert.alert("Video Selection Error", err.message || "Failed to pick video");
    }
  };

  const handleContinue = async () => {
    if (filledPhotosCount < 3) {
      setError("Exactly 3 profile pictures are required to ensure authentic visual verification.");
      return;
    }
    if (!videoIntroUrl.trim()) {
      setError("An introductory video (under 1 minute) is required for liveness verification.");
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
        // Upload any photo that might need saving
        for (let i = 0; i < 3; i++) {
          const photoUri = photos[i];
          if (photoUri && !photoUri.startsWith("http")) {
            try {
              await userService.uploadPhoto(user.accountId, photoUri, i + 1);
            } catch (pErr) {
              console.warn(`[MediaUpload] Photo upload error for slot ${i + 1}:`, pErr);
            }
          }
        }

        await userService.updateProfile(user.accountId, {
          videoIntroUrl: videoIntroUrl.trim(),
          videoDurationSeconds: videoDuration,
        } as any);

        updateLocalUser({
          videoIntroUrl: videoIntroUrl.trim(),
          videoDurationSeconds: videoDuration,
        });

        await refreshUser();
      }
      router.push("/(onboarding)/preferences" as any);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save media footprint.");
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
        To prevent deceptive imagery, Lifeline requires exactly 3 recent photos and a short video introduction (under 60s).
      </Text>

      {/* 3 Photos Requirement Status */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-sm font-bold text-slate-800">
            Profile Photos ({filledPhotosCount}/3 Selected)
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
            const isUploaded = photoUrl && photoUrl.trim().length > 0;
            const isSlotUploading = uploadingSlot === index;

            return (
              <TouchableOpacity
                key={index}
                onPress={() => handlePickPhoto(index)}
                disabled={isSlotUploading}
                activeOpacity={0.8}
                className="flex-1 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 bg-slate-100 items-center justify-center relative"
              >
                {isSlotUploading ? (
                  <View className="items-center justify-center p-2">
                    <ActivityIndicator size="small" color="#2563EB" />
                    <Text className="text-[10px] font-bold text-blue-600 mt-1">
                      Uploading...
                    </Text>
                  </View>
                ) : isUploaded ? (
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
                      <Camera size={20} color="#2563EB" />
                    </View>
                    <Text className="text-xs font-bold text-slate-600 text-center">
                      Select #{index + 1}
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
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center flex-1 mr-2">
              <View className="mr-3 rounded-2xl bg-blue-100 p-2.5">
                <Film size={20} color="#2563EB" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-slate-900" numberOfLines={1}>
                  {videoIntroUrl ? "Video Selected" : "No Video Selected"}
                </Text>
                <Text className="text-xs text-slate-500">
                  Duration: {videoDuration}s / 60s max
                </Text>
              </View>
            </View>
            <Badge
              label={videoDuration <= 60 && videoIntroUrl ? "Valid (<60s)" : "Required"}
              variant={videoDuration <= 60 && videoIntroUrl ? "success" : "warning"}
            />
          </View>

          <Button
            title={videoIntroUrl ? "Change Selected Video" : "Record / Select Video"}
            variant="outline"
            size="sm"
            leftIcon={<Video size={16} color="#2563EB" />}
            onPress={handlePickVideo}
            className="mb-3"
          />

          <Input
            label="Or Enter Video Stream URL"
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
