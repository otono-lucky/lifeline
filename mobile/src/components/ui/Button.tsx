// components/ui/Button.tsx
// Standardized Button component with brand variants and merged classNames

import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
} from "react-native";

export type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled = false,
  className = "",
  style,
  ...props
}) => {
  const getContainerStyle = () => {
    const base = "flex-row items-center justify-center rounded-2xl";

    let sizeClasses = "min-h-[48px] px-6 py-3.5";
    if (size === "sm") sizeClasses = "min-h-[40px] px-4 py-2";
    if (size === "lg") sizeClasses = "min-h-[56px] px-8 py-4";

    let variantClasses = "bg-blue-600 shadow-sm active:bg-blue-700";
    if (variant === "secondary") variantClasses = "bg-slate-200 active:bg-slate-300";
    if (variant === "outline") variantClasses = "border-2 border-blue-600 bg-transparent active:bg-blue-50";
    if (variant === "danger") variantClasses = "bg-red-600 active:bg-red-700";
    if (variant === "ghost") variantClasses = "bg-transparent active:bg-slate-100";

    const opacity = disabled || isLoading ? "opacity-50" : "opacity-100";

    return `${base} ${sizeClasses} ${variantClasses} ${opacity} ${className}`;
  };

  const getTextStyle = () => {
    let sizeText = "text-base font-semibold";
    if (size === "sm") sizeText = "text-sm font-semibold";
    if (size === "lg") sizeText = "text-lg font-bold";

    let colorText = "text-white";
    if (variant === "secondary") colorText = "text-slate-800";
    if (variant === "outline") colorText = "text-blue-600";
    if (variant === "ghost") colorText = "text-slate-600";

    return `${sizeText} ${colorText}`;
  };

  return (
    <TouchableOpacity
      className={getContainerStyle()}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      style={style}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === "secondary" || variant === "outline" || variant === "ghost" ? "#2563EB" : "#FFFFFF"}
          size="small"
        />
      ) : (
        <View className="flex-row items-center justify-center">
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <Text className={getTextStyle()}>{title}</Text>
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button;
