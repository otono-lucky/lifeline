// components/ui/StateView.tsx
// Standardized State Component for Loading / Error / Empty UI

import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { AlertCircle, Inbox, RefreshCw } from "lucide-react-native";
import Button from "./Button";

export interface StateViewProps {
  type: "loading" | "error" | "empty";
  title?: string;
  message?: string;
  onRetry?: () => void;
  icon?: React.ReactNode;
  actionTitle?: string;
  onAction?: () => void;
}

export const StateView: React.FC<StateViewProps> = ({
  type,
  title,
  message,
  onRetry,
  icon,
  actionTitle,
  onAction,
}) => {
  if (type === "loading") {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-4 text-base font-bold text-slate-800">
          {title || "Loading..."}
        </Text>
        {message && (
          <Text className="mt-1 text-center text-xs text-slate-500 max-w-xs">
            {message}
          </Text>
        )}
      </View>
    );
  }

  if (type === "error") {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <View className="rounded-full bg-red-50 p-4 mb-3">
          {icon || <AlertCircle size={36} color="#E11D48" />}
        </View>
        <Text className="text-lg font-bold text-slate-900 text-center">
          {title || "Something went wrong"}
        </Text>
        <Text className="mt-2 text-center text-xs text-slate-500 leading-relaxed max-w-xs mb-6">
          {message || "We encountered an issue loading this content. Please try again."}
        </Text>
        {onRetry && (
          <Button
            title="Try Again"
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={16} color="#2563EB" />}
            onPress={onRetry}
          />
        )}
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center p-8">
      <View className="rounded-full bg-slate-100 p-4 mb-3">
        {icon || <Inbox size={36} color="#64748B" />}
      </View>
      <Text className="text-lg font-bold text-slate-900 text-center">
        {title || "No items found"}
      </Text>
      <Text className="mt-2 text-center text-xs text-slate-500 leading-relaxed max-w-xs mb-6">
        {message || "There are no entries to display right now."}
      </Text>
      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          size="sm"
          onPress={onAction}
        />
      )}
    </View>
  );
};

export default StateView;
