// app/(onboarding)/church-selection.tsx
// Phase 4: Step 1 Church Selection (Parent-Branch RCCG vs Individual Parish)

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import ProgressBar from "../../components/ui/ProgressBar";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import userService from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import { Church, CheckCircle, ChevronRight, Building } from "lucide-react-native";

interface ChurchOption {
  id: string;
  officialName: string;
  aka?: string;
  churchModel: "PARENT_BRANCH" | "INDIVIDUAL_PARISH";
  state: string;
  city: string;
}

export default function ChurchSelectionScreen() {
  const router = useRouter();
  const { user, updateLocalUser } = useAuth();

  const [churches, setChurches] = useState<ChurchOption[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<ChurchOption | null>(null);
  const [branchName, setBranchName] = useState(user?.branchName || "");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChurches = async () => {
      try {
        const response = await userService.getPublicChurches();
        if (response.success) {
          setChurches(response.data.churches);
          if (user?.churchId) {
            const current = response.data.churches.find((c) => c.id === user.churchId);
            if (current) setSelectedChurch(current);
          }
        }
      } catch (err: any) {
        console.warn("Failed to load churches:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChurches();
  }, [user?.churchId]);

  const handleContinue = async () => {
    if (!selectedChurch) {
      setError("Please select your church");
      return;
    }
    if (selectedChurch.churchModel === "PARENT_BRANCH" && !branchName.trim()) {
      setError("Please specify your parish / branch name (e.g. City of David, Jesus House)");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      if (user?.accountId) {
        await userService.updateProfile(user.accountId, {
          church: selectedChurch.id,
          churchId: selectedChurch.id,
          branchName: branchName.trim(),
        } as any);
        updateLocalUser({
          churchId: selectedChurch.id,
          churchName: selectedChurch.officialName,
          branchName: branchName.trim(),
        });
      }
      router.push("/(onboarding)/location-profile" as any);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save church selection.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenWrapper
      title="Church Affiliation"
      subtitle="Step 1 of 7"
      showBack={true}
      onBack={() => router.replace("/(auth)/login" as any)}
    >
      <ProgressBar currentStep={1} totalSteps={7} label="Step 1: Church" />

      <Text className="text-2xl font-black text-slate-900 mb-1">
        Select Your Church Body
      </Text>
      <Text className="text-sm text-slate-500 mb-6">
        Select your denomination or specific parish for local pastoral oversight.
      </Text>

      {isLoading ? (
        <View className="py-12 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="mt-3 text-sm text-slate-500 font-medium">Loading churches...</Text>
        </View>
      ) : (
        <View className="mb-4">
          <Text className="text-sm font-bold text-slate-700 mb-2">Available Churches</Text>
          <View className="gap-3">
            {churches.map((church) => {
              const isSelected = selectedChurch?.id === church.id;
              return (
                <TouchableOpacity
                  key={church.id}
                  onPress={() => {
                    setSelectedChurch(church);
                    setError("");
                  }}
                  activeOpacity={0.8}
                >
                  <Card
                    className={`border-2 transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/30 shadow-sm"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1 mr-3">
                        <View
                          className={`mr-3 rounded-2xl p-3 ${
                            isSelected ? "bg-blue-600" : "bg-slate-100"
                          }`}
                        >
                          <Church
                            size={22}
                            color={isSelected ? "#FFFFFF" : "#64748B"}
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-bold text-slate-900" numberOfLines={1}>
                            {church.officialName}
                          </Text>
                          <Text className="text-xs text-slate-500 mt-0.5">
                            {church.city}, {church.state}
                          </Text>
                          <View className="mt-2 flex-row">
                            <Badge
                              label={
                                church.churchModel === "PARENT_BRANCH"
                                  ? "Parent-Branch Model"
                                  : "Individual Parish"
                              }
                              variant={church.churchModel === "PARENT_BRANCH" ? "primary" : "purple"}
                            />
                          </View>
                        </View>
                      </View>
                      {isSelected ? (
                        <CheckCircle size={24} color="#2563EB" />
                      ) : (
                        <ChevronRight size={20} color="#94A3B8" />
                      )}
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Branch Name input for Parent-Branch churches */}
          {selectedChurch?.churchModel === "PARENT_BRANCH" && (
            <View className="mt-6">
              <Input
                label="Specific Parish / Branch Name"
                placeholder="e.g. City of David, Jesus House, Glory Parish"
                helperText="Enter the name of your specific branch."
                leftIcon={<Building size={18} color="#64748B" />}
                value={branchName}
                onChangeText={(text) => {
                  setBranchName(text);
                  setError("");
                }}
              />
            </View>
          )}

          {error ? (
            <Text className="mt-2 text-xs font-bold text-red-500">{error}</Text>
          ) : null}

          <Button
            title="Continue to Location & Heritage"
            isLoading={isSaving}
            onPress={handleContinue}
            className="mt-6 mb-8"
          />
        </View>
      )}
    </ScreenWrapper>
  );
}
