// components/layout/ScreenWrapper.tsx
// Universal Screen Layout with Safe Area, standard header, and background styling

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ViewProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";

interface ScreenWrapperProps extends ViewProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  isScrollable?: boolean;
  headerBackground?: "light" | "indigo";
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  isScrollable = true,
  headerBackground = "light",
  className = "",
  style,
  ...props
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const Content = (
    <View className={`flex-1 px-5 py-4 ${className}`} style={style} {...props}>
      {children}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "left", "right"]}>
      <StatusBar
        barStyle={headerBackground === "indigo" ? "light-content" : "dark-content"}
        backgroundColor={headerBackground === "indigo" ? "#1E1B4B" : "#F8FAFC"}
      />

      {/* Header Bar */}
      {(title || showBack || rightAction) && (
        <View
          className={`flex-row items-center justify-between px-5 py-3.5 border-b ${
            headerBackground === "indigo"
              ? "bg-indigo-950 border-indigo-900"
              : "bg-white border-slate-100"
          }`}
        >
          <View className="flex-row items-center flex-1">
            {showBack && (
              <TouchableOpacity
                onPress={handleBack}
                className={`mr-3 rounded-full p-2 ${
                  headerBackground === "indigo" ? "bg-indigo-900" : "bg-slate-100"
                }`}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ArrowLeft
                  size={20}
                  color={headerBackground === "indigo" ? "#FFFFFF" : "#0F172A"}
                />
              </TouchableOpacity>
            )}
            {title && (
              <View>
                <Text
                  className={`text-lg font-bold ${
                    headerBackground === "indigo" ? "text-white" : "text-slate-900"
                  }`}
                  numberOfLines={1}
                >
                  {title}
                </Text>
                {subtitle && (
                  <Text
                    className={`text-xs ${
                      headerBackground === "indigo"
                        ? "text-indigo-200"
                        : "text-slate-500"
                    }`}
                  >
                    {subtitle}
                  </Text>
                )}
              </View>
            )}
          </View>
          {rightAction && <View className="ml-2">{rightAction}</View>}
        </View>
      )}

      {/* Body Area */}
      {isScrollable ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {Content}
        </ScrollView>
      ) : (
        Content
      )}
    </SafeAreaView>
  );
};

export default ScreenWrapper;
