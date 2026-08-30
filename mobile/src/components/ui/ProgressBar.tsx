// components/ui/ProgressBar.tsx
// Multi-step Onboarding Progress Bar

import React from "react";
import { View, Text } from "react-native";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  label,
}) => {
  const percentage = Math.min(100, Math.round((currentStep / totalSteps) * 100));

  return (
    <View className="w-full mb-6">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {label || `Step ${currentStep} of ${totalSteps}`}
        </Text>
        <Text className="text-xs font-bold text-blue-600">
          {percentage}% Completed
        </Text>
      </View>

      <View className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
        <View
          className="h-full bg-blue-600 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
};

export default ProgressBar;
