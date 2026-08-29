// components/themed-text.tsx
// NativeWind-powered ThemedText component

import React from "react";
import { Text, type TextProps } from "react-native";

export type ThemedTextProps = TextProps & {
  type?: "default" | "title" | "small" | "smallBold" | "subtitle" | "link" | "linkPrimary" | "code";
  themeColor?: string;
  className?: string;
};

export function ThemedText({
  type = "default",
  themeColor,
  className = "",
  children,
  ...rest
}: ThemedTextProps) {
  const getTypeClasses = () => {
    switch (type) {
      case "title":
        return "text-4xl font-extrabold text-slate-900";
      case "subtitle":
        return "text-2xl font-bold text-slate-800";
      case "small":
        return "text-xs text-slate-500";
      case "smallBold":
        return "text-xs font-bold text-slate-700";
      case "link":
      case "linkPrimary":
        return "text-sm font-semibold text-blue-600";
      case "code":
        return "font-mono text-xs text-slate-700 bg-slate-100 p-1 rounded";
      case "default":
      default:
        return "text-base font-normal text-slate-900";
    }
  };

  return (
    <Text className={`${getTypeClasses()} ${className}`} {...rest}>
      {children}
    </Text>
  );
}

export default ThemedText;
