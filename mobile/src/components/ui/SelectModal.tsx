// components/ui/SelectModal.tsx
// Searchable Select Modal Picker for verified dropdown choices (Country, State, City/LGA)

import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ChevronDown, Search, X, Check } from "lucide-react-native";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectModalProps {
  label?: string;
  placeholder?: string;
  value?: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  allowCustomInput?: boolean;
}

export const SelectModal: React.FC<SelectModalProps> = ({
  label,
  placeholder = "Select an option",
  value,
  options,
  onSelect,
  disabled = false,
  isLoading = false,
  error,
  helperText,
  leftIcon,
  allowCustomInput = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value.toLowerCase() === (value || "").toLowerCase());
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, searchQuery]);

  const handleOpen = () => {
    if (disabled || isLoading) return;
    setSearchQuery("");
    setIsOpen(true);
  };

  const handleSelect = (val: string) => {
    onSelect(val);
    setIsOpen(false);
  };

  return (
    <View className="mb-4 w-full">
      {label && (
        <Text className="mb-1.5 text-sm font-medium text-slate-700">
          {label}
        </Text>
      )}

      <TouchableOpacity
        onPress={handleOpen}
        disabled={disabled || isLoading}
        activeOpacity={0.7}
        className={`flex-row items-center justify-between rounded-2xl border px-4 py-3.5 ${
          disabled
            ? "border-slate-200 bg-slate-100 opacity-60"
            : error
            ? "border-red-500 bg-red-50/20"
            : "border-slate-200 bg-white"
        }`}
      >
        <View className="flex-row items-center flex-1 mr-2">
          {leftIcon && <View className="mr-3">{leftIcon}</View>}
          <Text
            numberOfLines={1}
            className={`text-base ${
              value ? "font-semibold text-slate-900" : "text-slate-400"
            }`}
          >
            {isLoading
              ? "Loading options..."
              : selectedOption?.label || value || placeholder}
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="small" color="#2563EB" />
        ) : (
          <ChevronDown size={18} color={disabled ? "#94A3B8" : "#64748B"} />
        )}
      </TouchableOpacity>

      {error ? (
        <Text className="mt-1 text-xs font-medium text-red-500">{error}</Text>
      ) : helperText ? (
        <Text className="mt-1 text-xs text-slate-500">{helperText}</Text>
      ) : null}

      {/* Picker Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsOpen(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1"
          >
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100">
              <Text className="text-lg font-bold text-slate-900">
                {label || placeholder}
              </Text>
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                className="rounded-full bg-slate-100 p-2"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Search input */}
            <View className="p-4 border-b border-slate-100">
              <View className="flex-row items-center rounded-xl bg-slate-100 px-3 py-2.5">
                <Search size={18} color="#94A3B8" />
                <TextInput
                  placeholder="Type to search..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="words"
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                  className="ml-2 flex-1 text-base text-slate-900"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <X size={16} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Options List */}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item, index) => `${item.value}_${index}`}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 30 }}
              renderItem={({ item }) => {
                const isSelected =
                  item.value.toLowerCase() === (value || "").toLowerCase();
                return (
                  <TouchableOpacity
                    onPress={() => handleSelect(item.value)}
                    activeOpacity={0.6}
                    className={`flex-row items-center justify-between px-5 py-4 border-b border-slate-100 ${
                      isSelected ? "bg-blue-50/50" : "bg-white active:bg-slate-50"
                    }`}
                  >
                    <Text
                      className={`text-base flex-1 mr-2 ${
                        isSelected
                          ? "font-bold text-blue-600"
                          : "font-medium text-slate-800"
                      }`}
                    >
                      {item.label}
                    </Text>
                    {isSelected && <Check size={20} color="#2563EB" />}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View className="items-center justify-center p-8">
                  <Text className="text-slate-400 text-sm text-center mb-4">
                    No matching results found for "{searchQuery}"
                  </Text>
                  {allowCustomInput && searchQuery.trim().length > 1 && (
                    <TouchableOpacity
                      onPress={() => handleSelect(searchQuery.trim())}
                      className="px-4 py-2.5 rounded-xl bg-blue-600"
                    >
                      <Text className="text-white font-semibold text-sm">
                        Use "{searchQuery.trim()}"
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              }
            />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default SelectModal;
