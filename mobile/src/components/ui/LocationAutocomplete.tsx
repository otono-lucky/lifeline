// components/ui/LocationAutocomplete.tsx
// Real-time location search autocomplete with Country, State, and City of Residence filtering

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MapPin, Search, X, Check } from "lucide-react-native";
import locationService, { LocationSuggestion } from "../../services/locationService";

interface LocationAutocompleteProps {
  label?: string;
  placeholder?: string;
  value: string;
  countryOfResidence?: string;
  stateOfResidence?: string;
  cityOfResidence?: string;
  onChangeText: (text: string) => void;
  onSelectSuggestion: (suggestion: LocationSuggestion) => void;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  label = "Street Address / Location",
  placeholder = "Start typing street, landmark, or area...",
  value,
  countryOfResidence,
  stateOfResidence,
  cityOfResidence,
  onChangeText,
  onSelectSuggestion,
  error,
  helperText,
  leftIcon,
}) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scopeLabel = useMemo(() => {
    return [cityOfResidence, stateOfResidence, countryOfResidence]
      .filter(Boolean)
      .join(", ");
  }, [cityOfResidence, stateOfResidence, countryOfResidence]);

  useEffect(() => {
    if (!isFocused || value.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await locationService.suggestLocations(
          value,
          countryOfResidence,
          stateOfResidence,
          cityOfResidence
        );
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch (err) {
        console.warn("[LocationAutocomplete] search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [value, countryOfResidence, stateOfResidence, cityOfResidence, isFocused]);

  const handleSelect = (suggestion: LocationSuggestion) => {
    setShowDropdown(false);
    setSuggestions([]);
    onSelectSuggestion(suggestion);
  };

  return (
    <View className="mb-4 w-full relative z-20">
      {label && (
        <View className="flex-row items-center justify-between mb-1.5">
          <Text className="text-sm font-medium text-slate-700">{label}</Text>
          {scopeLabel ? (
            <Text
              numberOfLines={1}
              className="text-xs text-blue-600 font-medium max-w-[200px]"
            >
              Scoped to: {scopeLabel}
            </Text>
          ) : null}
        </View>
      )}

      {/* Text Input */}
      <View
        className={`flex-row items-center rounded-2xl border bg-white px-4 py-3.5 ${
          error
            ? "border-red-500 bg-red-50/20"
            : isFocused
            ? "border-blue-600 bg-blue-50/10 shadow-sm"
            : "border-slate-200"
        }`}
      >
        {leftIcon ? (
          <View className="mr-3">{leftIcon}</View>
        ) : (
          <MapPin size={18} color="#64748B" className="mr-3" />
        )}

        <TextInput
          className="flex-1 text-base text-slate-900 placeholder:text-slate-400"
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            if (!showDropdown && text.trim().length >= 2) {
              setShowDropdown(true);
            }
          }}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay closing so taps on suggestion items register
            setTimeout(() => {
              setIsFocused(false);
              setShowDropdown(false);
            }, 250);
          }}
        />

        {isSearching ? (
          <ActivityIndicator size="small" color="#2563EB" />
        ) : value.length > 0 ? (
          <TouchableOpacity
            onPress={() => {
              onChangeText("");
              setSuggestions([]);
              setShowDropdown(false);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={16} color="#94A3B8" />
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <Text className="mt-1 text-xs font-medium text-red-500">{error}</Text>
      ) : helperText ? (
        <Text className="mt-1 text-xs text-slate-500">{helperText}</Text>
      ) : null}

      {/* Suggestions Dropdown Popover */}
      {showDropdown && suggestions.length > 0 && (
        <View className="mt-1 w-full rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden z-30">
          <View className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex-row items-center justify-between">
            <Text
              numberOfLines={1}
              className="text-xs font-semibold uppercase text-slate-400 flex-1 mr-2"
            >
              Verified Places ({scopeLabel || "Global"})
            </Text>
            <TouchableOpacity onPress={() => setShowDropdown(false)}>
              <Text className="text-xs text-blue-600 font-medium">Dismiss</Text>
            </TouchableOpacity>
          </View>

          {suggestions.map((item, index) => (
            <TouchableOpacity
              key={`${item.placeId}_${index}`}
              onPress={() => handleSelect(item)}
              activeOpacity={0.7}
              className="flex-row items-start px-4 py-3 border-b border-slate-100 active:bg-blue-50/50"
            >
              <View className="rounded-full bg-blue-50 p-2 mr-3 mt-0.5">
                <MapPin size={16} color="#2563EB" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-slate-900" numberOfLines={1}>
                  {item.mainText}
                </Text>
                {item.secondaryText ? (
                  <Text className="text-xs text-slate-500 mt-0.5" numberOfLines={2}>
                    {item.secondaryText}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default LocationAutocomplete;
