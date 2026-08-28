// components/ui/Card.tsx
// Elevated Card container

import React from "react";
import { View, ViewProps } from "react-native";

interface CardProps extends ViewProps {
  variant?: "default" | "elevated" | "outlined";
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  className = "",
  style,
  ...props
}) => {
  let styleClasses = "rounded-3xl bg-white p-5 border border-slate-100 shadow-sm";
  if (variant === "elevated") {
    styleClasses = "rounded-3xl bg-white p-6 shadow-md border-0";
  } else if (variant === "outlined") {
    styleClasses = "rounded-3xl bg-white p-5 border border-slate-200 shadow-none";
  }

  return (
    <View className={`${styleClasses} ${className}`} style={style} {...props}>
      {children}
    </View>
  );
};

export default Card;
