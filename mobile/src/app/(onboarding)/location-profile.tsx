// app/(onboarding)/location-profile.tsx
// Phase 4: Step 2 Origin & Residence Location + WhatsApp Number

import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import ProgressBar from "../../components/ui/ProgressBar";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import userService from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import { MapPin, Globe, PhoneCall } from "lucide-react-native";

export default function LocationProfileScreen() {
  const router = useRouter();
  const { user, updateLocalUser } = useAuth();

  const [formData, setFormData] = useState({
    originCountry: user?.originCountry || "Nigeria",
    originState: user?.originState || "",
    originLga: user?.originLga || "",
    residenceCountry: user?.residenceCountry || "Nigeria",
    residenceState: user?.residenceState || "",
    residenceCity: user?.residenceCity || "",
    residenceAddress: user?.residenceAddress || "",
    whatsappNumber: user?.whatsappNumber || user?.phone || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.originState.trim()) newErrors.originState = "State of origin is required";
    if (!formData.originLga.trim()) newErrors.originLga = "LGA is required";
    if (!formData.residenceState.trim()) newErrors.residenceState = "Current state of residence is required";
    if (!formData.residenceCity.trim()) newErrors.residenceCity = "City is required";
    if (!formData.residenceAddress.trim()) newErrors.residenceAddress = "Residential address is required";
    if (!formData.whatsappNumber.trim()) newErrors.whatsappNumber = "WhatsApp number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      if (user?.accountId) {
        await userService.updateProfile(user.accountId, {
          originCountry: formData.originCountry.trim(),
          originState: formData.originState.trim(),
          originLga: formData.originLga.trim(),
          residenceCountry: formData.residenceCountry.trim(),
          residenceState: formData.residenceState.trim(),
          residenceCity: formData.residenceCity.trim(),
          residenceAddress: formData.residenceAddress.trim(),
          residenceFormattedAddress: `${formData.residenceAddress}, ${formData.residenceCity}, ${formData.residenceState}`,
          whatsappNumber: formData.whatsappNumber.trim(),
        } as any);

        updateLocalUser({
          originCountry: formData.originCountry,
          originState: formData.originState,
          originLga: formData.originLga,
          residenceCountry: formData.residenceCountry,
          residenceState: formData.residenceState,
          residenceCity: formData.residenceCity,
          residenceAddress: formData.residenceAddress,
          whatsappNumber: formData.whatsappNumber,
        });
      }
      router.push("/(onboarding)/career-financial" as any);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save location details.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenWrapper
      title="Location & Heritage"
      subtitle="Step 2 of 7"
      showBack={true}
    >
      <ProgressBar currentStep={2} totalSteps={7} label="Step 2: Location" />

      <Text className="text-2xl font-black text-slate-900 mb-1">
        Where Are You Located?
      </Text>
      <Text className="text-sm text-slate-500 mb-6">
        Your origin and residence details enable proximity weighting while preserving exact address privacy.
      </Text>

      {/* State of Origin Section */}
      <Text className="text-sm font-bold text-slate-900 mb-2">Heritage & Origin</Text>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Input
            label="State of Origin"
            placeholder="e.g. Lagos, Edo, Enugu"
            leftIcon={<Globe size={18} color="#64748B" />}
            value={formData.originState}
            onChangeText={(text) => setFormData({ ...formData, originState: text })}
            error={errors.originState}
          />
        </View>
        <View className="flex-1">
          <Input
            label="LGA"
            placeholder="e.g. Ikeja, Oredo"
            value={formData.originLga}
            onChangeText={(text) => setFormData({ ...formData, originLga: text })}
            error={errors.originLga}
          />
        </View>
      </View>

      {/* Current Residence Section */}
      <Text className="text-sm font-bold text-slate-900 mt-2 mb-2">Current Residence</Text>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Input
            label="State of Residence"
            placeholder="e.g. Lagos, FCT Abuja"
            leftIcon={<MapPin size={18} color="#64748B" />}
            value={formData.residenceState}
            onChangeText={(text) => setFormData({ ...formData, residenceState: text })}
            error={errors.residenceState}
          />
        </View>
        <View className="flex-1">
          <Input
            label="City / Town"
            placeholder="e.g. Lekki, Maitama"
            value={formData.residenceCity}
            onChangeText={(text) => setFormData({ ...formData, residenceCity: text })}
            error={errors.residenceCity}
          />
        </View>
      </View>

      <Input
        label="Street Address"
        placeholder="e.g. 12 Admiralty Way"
        helperText="Exact street address is strictly confidential (Privacy Firewall)."
        value={formData.residenceAddress}
        onChangeText={(text) => setFormData({ ...formData, residenceAddress: text })}
        error={errors.residenceAddress}
      />

      {/* Dual Phone: WhatsApp Support */}
      <Text className="text-sm font-bold text-slate-900 mt-2 mb-2">Counselor Verification Line</Text>
      <Input
        label="WhatsApp Phone Number"
        placeholder="+234 800 000 0000"
        keyboardType="phone-pad"
        helperText="Used for counselor video/voice check-in and dynamic calendar alerts."
        leftIcon={<PhoneCall size={18} color="#64748B" />}
        value={formData.whatsappNumber}
        onChangeText={(text) => setFormData({ ...formData, whatsappNumber: text })}
        error={errors.whatsappNumber}
      />

      <Button
        title="Continue to Career & Finances"
        isLoading={isSaving}
        onPress={handleContinue}
        className="mt-6 mb-8"
      />
    </ScreenWrapper>
  );
}
