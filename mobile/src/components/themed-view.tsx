// components/themed-view.tsx
// NativeWind-powered ThemedView component

import React from "react";
import { View, type ViewProps } from "react-native";

export type ThemedViewProps = ViewProps & {
  type?: "default" | "card" | "backgroundElement" | "backgroundSelected";
  className?: string;
};

export function ThemedView({
  type = "default",
  className = "",
  children,
  ...rest
}: ThemedViewProps) {
  const getTypeClasses = () => {
    switch (type) {
      case "card":
        return "bg-white rounded-2xl p-4 border border-slate-200 shadow-sm";
      case "backgroundSelected":
        return "bg-blue-50";
      case "backgroundElement":
        return "bg-slate-50";
      case "default":
      default:
        return "bg-white";
    }
  };

  return (
    <View className={`${getTypeClasses()} ${className}`} {...rest}>
      {children}
    </View>
  );
}

export default ThemedView;
