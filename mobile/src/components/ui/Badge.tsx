// components/ui/Badge.tsx
// Status & categorical pill badges

import React from "react";
import { View, Text, ViewProps } from "react-native";

export type BadgeVariant =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "purple"
  | "neutral";

interface BadgeProps extends ViewProps {
  label: string;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "primary",
  icon,
  className = "",
  style,
  ...props
}) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case "success":
        return {
          container: "bg-green-50 border border-green-200",
          text: "text-green-700",
        };
      case "warning":
        return {
          container: "bg-amber-50 border border-amber-200",
          text: "text-amber-700",
        };
      case "danger":
        return {
          container: "bg-red-50 border border-red-200",
          text: "text-red-700",
        };
      case "purple":
        return {
          container: "bg-purple-50 border border-purple-200",
          text: "text-purple-700",
        };
      case "neutral":
        return {
          container: "bg-slate-100 border border-slate-200",
          text: "text-slate-700",
        };
      case "primary":
      default:
        return {
          container: "bg-blue-50 border border-blue-200",
          text: "text-blue-700",
        };
    }
  };

  const styles = getBadgeStyle();

  return (
    <View
      className={`flex-row items-center self-start rounded-full px-3 py-1 ${styles.container} ${className}`}
      style={style}
      {...props}
    >
      {icon && <View className="mr-1.5">{icon}</View>}
      <Text className={`text-xs font-bold uppercase tracking-wider ${styles.text}`}>
        {label}
      </Text>
    </View>
  );
};

export default Badge;
