// components/ui/SlotCounter.tsx
// Visualizer for the "Shame-Free" 3-Slot Match Request Constraint

import React from "react";
import { View, Text } from "react-native";
import { Send } from "lucide-react-native";

interface SlotCounterProps {
  usedSlots: number;
  totalSlots?: number;
}

export const SlotCounter: React.FC<SlotCounterProps> = ({
  usedSlots,
  totalSlots = 3,
}) => {
  const remaining = Math.max(0, totalSlots - usedSlots);

  return (
    <View className="flex-row items-center justify-between rounded-2xl bg-indigo-950 p-4 shadow-sm">
      <View className="flex-row items-center">
        <View className="mr-3 rounded-xl bg-blue-500/20 p-2 border border-blue-400/30">
          <Send size={18} color="#93C5FD" />
        </View>
        <View>
          <Text className="text-xs font-bold uppercase tracking-wider text-blue-200">
            Active Request Slots
          </Text>
          <Text className="text-sm font-medium text-slate-300">
            {remaining > 0
              ? `${remaining} of ${totalSlots} available`
              : "All 3 slots active"}
          </Text>
        </View>
      </View>

      {/* 3 Pill indicators */}
      <View className="flex-row items-center gap-1.5">
        {[...Array(totalSlots)].map((_, index) => {
          const isUsed = index < usedSlots;
          return (
            <View
              key={index}
              className={`h-3.5 w-7 rounded-full transition-all ${
                isUsed
                  ? "bg-blue-500 shadow-sm"
                  : "bg-slate-800 border border-slate-700"
              }`}
            />
          );
        })}
      </View>
    </View>
  );
};

export default SlotCounter;
