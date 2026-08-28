// components/ui/Avatar.tsx
// User Avatar with fallback initial generator & counselor badge

import React from "react";
import { View, Text, Image } from "react-native";
import { ShieldCheck } from "lucide-react-native";

interface AvatarProps {
  url?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  isCounselor?: boolean;
  isVerified?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  url,
  name,
  size = "md",
  isCounselor = false,
  isVerified = false,
}) => {
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (fullName[0] || "?").toUpperCase();
  };

  let dimension = "w-12 h-12";
  let textSize = "text-base";
  if (size === "sm") {
    dimension = "w-9 h-9";
    textSize = "text-xs";
  } else if (size === "lg") {
    dimension = "w-16 h-16";
    textSize = "text-xl";
  } else if (size === "xl") {
    dimension = "w-24 h-24";
    textSize = "text-3xl";
  }

  return (
    <View className="relative">
      {url ? (
        <Image
          source={{ uri: url }}
          className={`${dimension} rounded-full bg-slate-200 border-2 border-white shadow-sm`}
        />
      ) : (
        <View
          className={`${dimension} items-center justify-center rounded-full bg-indigo-900 border-2 border-white shadow-sm`}
        >
          <Text className={`font-bold text-white ${textSize}`}>
            {getInitials(name)}
          </Text>
        </View>
      )}

      {/* Verified or Counselor indicator badge */}
      {isCounselor ? (
        <View className="absolute bottom-0 right-0 rounded-full bg-purple-600 p-1 border-2 border-white">
          <ShieldCheck size={12} color="#FFFFFF" />
        </View>
      ) : isVerified ? (
        <View className="absolute bottom-0 right-0 rounded-full bg-green-600 p-1 border-2 border-white">
          <ShieldCheck size={12} color="#FFFFFF" />
        </View>
      ) : null}
    </View>
  );
};

export default Avatar;
