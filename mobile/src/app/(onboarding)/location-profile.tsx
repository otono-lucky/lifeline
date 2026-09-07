// app/(onboarding)/location-profile.tsx
// Phase 4: Step 2 Origin & Residence Location + WhatsApp Number
// Standardized & verified location selection with real-time keyword suggestions biased by Country of Residence

import React, { useState, useEffect } from "react";
import { View, Text, Alert, Switch } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import ProgressBar from "../../components/ui/ProgressBar";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import SelectModal, { SelectOption } from "../../components/ui/SelectModal";
import LocationAutocomplete from "../../components/ui/LocationAutocomplete";
import userService from "../../services/userService";
import locationService, { LocationSuggestion } from "../../services/locationService";
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
    residenceFormattedAddress: (user as any)?.residenceFormattedAddress || "",
    residenceLatitude: (user as any)?.residenceLatitude || null,
    residenceLongitude: (user as any)?.residenceLongitude || null,
    residencePlaceId: (user as any)?.residencePlaceId || null,
    whatsappNumber: user?.whatsappNumber || user?.phone || "",
  });

  const [sameAsOrigin, setSameAsOrigin] = useState(false);

  // Available options
  const [countryOptions, setCountryOptions] = useState<SelectOption[]>([]);
  const [originStateOptions, setOriginStateOptions] = useState<SelectOption[]>([]);
  const [originLgaOptions, setOriginLgaOptions] = useState<SelectOption[]>([]);
  const [residenceStateOptions, setResidenceStateOptions] = useState<SelectOption[]>([]);
  const [residenceCityOptions, setResidenceCityOptions] = useState<SelectOption[]>([]);

  // Loading states
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingOriginStates, setIsLoadingOriginStates] = useState(false);
  const [isLoadingOriginLgas, setIsLoadingOriginLgas] = useState(false);
  const [isLoadingResidenceStates, setIsLoadingResidenceStates] = useState(false);
  const [isLoadingResidenceCities, setIsLoadingResidenceCities] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // 1. Load countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoadingCountries(true);
      try {
        const countries = await locationService.getCountries();
        setCountryOptions(countries);
      } catch (err) {
        console.warn("Failed to load countries:", err);
      } finally {
        setIsLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  // 2. Load origin states when originCountry changes
  useEffect(() => {
    if (!formData.originCountry) {
      setOriginStateOptions([]);
      return;
    }

    const fetchStates = async () => {
      setIsLoadingOriginStates(true);
      try {
        const states = await locationService.getStates(formData.originCountry);
        setOriginStateOptions(states);
      } catch (err) {
        console.warn("Failed to load origin states:", err);
      } finally {
        setIsLoadingOriginStates(false);
      }
    };
    fetchStates();
  }, [formData.originCountry]);

  // 3. Load origin LGAs/cities when originState changes
  useEffect(() => {
    if (!formData.originCountry || !formData.originState) {
      setOriginLgaOptions([]);
      return;
    }

    const fetchCities = async () => {
      setIsLoadingOriginLgas(true);
      try {
        const lgas = await locationService.getCities(formData.originCountry, formData.originState);
        setOriginLgaOptions(lgas);
      } catch (err) {
        console.warn("Failed to load origin LGAs:", err);
      } finally {
        setIsLoadingOriginLgas(false);
      }
    };
    fetchCities();
  }, [formData.originCountry, formData.originState]);

  // 4. Load residence states when residenceCountry changes
  useEffect(() => {
    if (!formData.residenceCountry) {
      setResidenceStateOptions([]);
      return;
    }

    const fetchStates = async () => {
      setIsLoadingResidenceStates(true);
      try {
        const states = await locationService.getStates(formData.residenceCountry);
        setResidenceStateOptions(states);
      } catch (err) {
        console.warn("Failed to load residence states:", err);
      } finally {
        setIsLoadingResidenceStates(false);
      }
    };
    fetchStates();
  }, [formData.residenceCountry]);

  // 5. Load residence cities when residenceState changes
  useEffect(() => {
    if (!formData.residenceCountry || !formData.residenceState) {
      setResidenceCityOptions([]);
      return;
    }

    const fetchCities = async () => {
      setIsLoadingResidenceCities(true);
      try {
        const cities = await locationService.getCities(formData.residenceCountry, formData.residenceState);
        setResidenceCityOptions(cities);
      } catch (err) {
        console.warn("Failed to load residence cities:", err);
      } finally {
        setIsLoadingResidenceCities(false);
      }
    };
    fetchCities();
  }, [formData.residenceCountry, formData.residenceState]);

  // Handle "Same as Place of Origin" toggle
  const handleToggleSameAsOrigin = (enabled: boolean) => {
    setSameAsOrigin(enabled);
    if (enabled) {
      setFormData((prev) => ({
        ...prev,
        residenceCountry: prev.originCountry,
        residenceState: prev.originState,
        residenceCity: prev.originLga,
      }));
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated.residenceCountry;
        delete updated.residenceState;
        delete updated.residenceCity;
        return updated;
      });
    }
  };

  // Handle selecting a suggested verified location
  const handleSelectLocationSuggestion = (suggestion: LocationSuggestion) => {
    setFormData((prev) => ({
      ...prev,
      residenceAddress: suggestion.streetAddress || suggestion.mainText,
      residenceFormattedAddress: suggestion.formattedAddress,
      residenceLatitude: suggestion.latitude,
      residenceLongitude: suggestion.longitude,
      residencePlaceId: suggestion.placeId,
      // If suggestion resolved state/city, update them
      residenceState: suggestion.state || prev.residenceState,
      residenceCity: suggestion.city || prev.residenceCity,
    }));

    // Clear address error if any
    if (errors.residenceAddress) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated.residenceAddress;
        return updated;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.originCountry?.trim()) newErrors.originCountry = "Country of origin is required";
    if (!formData.originState?.trim()) newErrors.originState = "State of origin is required";
    if (!formData.originLga?.trim()) newErrors.originLga = "LGA is required";

    if (!formData.residenceCountry?.trim()) newErrors.residenceCountry = "Country of residence is required";
    if (!formData.residenceState?.trim()) newErrors.residenceState = "State of residence is required";
    if (!formData.residenceCity?.trim()) newErrors.residenceCity = "City is required";
    if (!formData.residenceAddress?.trim()) newErrors.residenceAddress = "Street address is required";
    if (!formData.whatsappNumber?.trim()) newErrors.whatsappNumber = "WhatsApp number is required";

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
          residenceFormattedAddress:
            formData.residenceFormattedAddress ||
            `${formData.residenceAddress}, ${formData.residenceCity}, ${formData.residenceState}`,
          residenceLatitude: formData.residenceLatitude,
          residenceLongitude: formData.residenceLongitude,
          residencePlaceId: formData.residencePlaceId,
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
          residenceLatitude: formData.residenceLatitude,
          residenceLongitude: formData.residenceLongitude,
          residenceFormattedAddress: formData.residenceFormattedAddress,
        } as any);
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
      isScrollable={true}
    >
      <ProgressBar currentStep={2} totalSteps={7} label="Step 2: Location" />

      <Text className="text-2xl font-black text-slate-900 mb-1">
        Where Are You Located?
      </Text>
      <Text className="text-sm text-slate-500 mb-6">
        Select your verified location details for accurate proximity matching while preserving exact address privacy.
      </Text>

      {/* ── State of Origin Section ─────────────────────────────────── */}
      <Text className="text-sm font-bold text-slate-900 mb-2">Heritage & Origin</Text>

      <SelectModal
        label="Country of Origin"
        placeholder="Select country"
        value={formData.originCountry}
        options={countryOptions}
        isLoading={isLoadingCountries}
        leftIcon={<Globe size={18} color="#64748B" />}
        error={errors.originCountry}
        onSelect={(country) => {
          setFormData((prev) => ({
            ...prev,
            originCountry: country,
            originState: "",
            originLga: "",
            ...(sameAsOrigin
              ? { residenceCountry: country, residenceState: "", residenceCity: "" }
              : {}),
          }));
        }}
      />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <SelectModal
            label="State of Origin"
            placeholder="Select state"
            value={formData.originState}
            options={originStateOptions}
            disabled={!formData.originCountry || isLoadingOriginStates}
            isLoading={isLoadingOriginStates}
            error={errors.originState}
            onSelect={(state) => {
              setFormData((prev) => ({
                ...prev,
                originState: state,
                originLga: "",
                ...(sameAsOrigin ? { residenceState: state, residenceCity: "" } : {}),
              }));
            }}
          />
        </View>

        <View className="flex-1">
          <SelectModal
            label="LGA of Origin"
            placeholder="Select LGA"
            value={formData.originLga}
            options={originLgaOptions}
            disabled={!formData.originState || isLoadingOriginLgas}
            isLoading={isLoadingOriginLgas}
            allowCustomInput={true}
            error={errors.originLga}
            onSelect={(lga) => {
              setFormData((prev) => ({
                ...prev,
                originLga: lga,
                ...(sameAsOrigin ? { residenceCity: lga } : {}),
              }));
            }}
          />
        </View>
      </View>

      {/* ── Same as Origin Checkbox/Toggle ───────────────────────────── */}
      <View className="my-3 flex-row items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
        <View className="flex-1 mr-3">
          <Text className="text-sm font-bold text-blue-950">
            Residence Same as Place of Origin
          </Text>
          <Text className="text-xs text-blue-800/80 mt-0.5">
            Auto-fill current residence from your heritage details above
          </Text>
        </View>
        <Switch
          value={sameAsOrigin}
          onValueChange={handleToggleSameAsOrigin}
          trackColor={{ false: "#CBD5E1", true: "#2563EB" }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* ── Current Residence Section ───────────────────────────────── */}
      <Text className="text-sm font-bold text-slate-900 mt-2 mb-2">Current Residence</Text>

      {!sameAsOrigin && (
        <SelectModal
          label="Country of Residence"
          placeholder="Select country"
          value={formData.residenceCountry}
          options={countryOptions}
          isLoading={isLoadingCountries}
          leftIcon={<Globe size={18} color="#64748B" />}
          error={errors.residenceCountry}
          onSelect={(country) => {
            setFormData((prev) => ({
              ...prev,
              residenceCountry: country,
              residenceState: "",
              residenceCity: "",
            }));
          }}
        />
      )}

      <View className="flex-row gap-3">
        <View className="flex-1">
          <SelectModal
            label="State of Residence"
            placeholder="Select state"
            value={formData.residenceState}
            options={residenceStateOptions}
            disabled={sameAsOrigin || !formData.residenceCountry || isLoadingResidenceStates}
            isLoading={isLoadingResidenceStates}
            leftIcon={<MapPin size={18} color="#64748B" />}
            error={errors.residenceState}
            onSelect={(state) => {
              setFormData((prev) => ({
                ...prev,
                residenceState: state,
                residenceCity: "",
              }));
            }}
          />
        </View>

        <View className="flex-1">
          <SelectModal
            label="City / Town"
            placeholder="Select city"
            value={formData.residenceCity}
            options={residenceCityOptions}
            disabled={sameAsOrigin || !formData.residenceState || isLoadingResidenceCities}
            isLoading={isLoadingResidenceCities}
            allowCustomInput={true}
            error={errors.residenceCity}
            onSelect={(city) => {
              setFormData((prev) => ({ ...prev, residenceCity: city }));
            }}
          />
        </View>
      </View>

      {/* ── Street Address with Keyword Autocomplete Suggestion ───── */}
      <LocationAutocomplete
        label="Street Address / Location"
        placeholder="Type street, landmark, or neighborhood..."
        value={formData.residenceAddress}
        countryOfResidence={formData.residenceCountry}
        stateOfResidence={formData.residenceState}
        cityOfResidence={formData.residenceCity}
        onChangeText={(text) =>
          setFormData((prev) => ({
            ...prev,
            residenceAddress: text,
            residenceFormattedAddress: "",
          }))
        }
        onSelectSuggestion={handleSelectLocationSuggestion}
        helperText="Exact street address is strictly confidential (Privacy Firewall). Suggestions are scoped to your selected state and city."
        error={errors.residenceAddress}
      />

      {/* Counselor Verification Line */}
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
