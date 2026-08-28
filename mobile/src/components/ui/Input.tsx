// components/ui/Input.tsx
// Mobile Form Input with label, icon support, and error state

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  isPassword = false,
  value,
  onChangeText,
  placeholder,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-4 w-full">
      {label && (
        <Text className="mb-1.5 text-sm font-medium text-slate-700">
          {label}
        </Text>
      )}

      <View
        className={`flex-row items-center rounded-2xl border bg-white px-4 py-3.5 transition-all ${
          error
            ? "border-red-500 bg-red-50/20"
            : isFocused
            ? "border-blue-600 ring-2 ring-blue-100"
            : "border-slate-200"
        }`}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}

        <TextInput
          className="flex-1 text-base text-slate-900 placeholder:text-slate-400"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword((prev) => !prev)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="ml-2"
          >
            {showPassword ? (
              <EyeOff size={20} color="#64748B" />
            ) : (
              <Eye size={20} color="#64748B" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <Text className="mt-1 text-xs font-medium text-red-500">{error}</Text>
      ) : helperText ? (
        <Text className="mt-1 text-xs text-slate-500">{helperText}</Text>
      ) : null}
    </View>
  );
};

export default Input;
