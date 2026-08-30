// app/(onboarding)/career-financial.tsx
// Phase 4: Step 3 Career & Financial Integrity (Salary Range + Privacy Firewall)

import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import ProgressBar from "../../components/ui/ProgressBar";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import userService from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import { SalaryRange } from "../../types";
import { Briefcase, ShieldCheck, DollarSign, Calendar } from "lucide-react-native";

const SALARY_OPTIONS: Array<{ label: string; value: SalaryRange; description: string }> = [
  {
    label: "₦0 - ₦100,000 / month",
    value: "RANGE_0_100K",
    description: "Entry / Early Career",
  },
  {
    label: "₦100,000 - ₦500,000 / month",
    value: "RANGE_100K_500K",
    description: "Mid-Level Professional",
  },
  {
    label: "₦500,000 - ₦1,000,000 / month",
    value: "RANGE_500K_1M",
    description: "Senior / Established",
  },
  {
    label: "₦1,000,000+ / month",
    value: "RANGE_1M_PLUS",
    description: "Executive / Business Owner",
  },
];

export default function CareerFinancialScreen() {
  const router = useRouter();
  const { user, updateLocalUser } = useAuth();

  const [occupation, setOccupation] = useState(user?.occupation || "");
  const [salaryRange, setSalaryRange] = useState<SalaryRange>(
    user?.salaryRange || "RANGE_100K_500K",
  );
  const [dateOfBirth, setDateOfBirth] = useState(
    user?.dateOfBirth ? user.dateOfBirth.split("T")[0] : "1995-06-15",
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!occupation.trim()) newErrors.occupation = "Occupation is required";
    if (!dateOfBirth.trim()) newErrors.dateOfBirth = "Date of birth is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      if (user?.accountId) {
        await userService.updateProfile(user.accountId, {
          occupation: occupation.trim(),
          salaryRange,
          dateOfBirth: new Date(dateOfBirth).toISOString() as any,
        } as any);

        updateLocalUser({
          occupation: occupation.trim(),
          salaryRange,
          dateOfBirth,
        });
      }
      router.push("/(onboarding)/social-identity" as any);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save career and financial details.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenWrapper
      title="Career & Finances"
      subtitle="Step 3 of 7"
      showBack={true}
    >
      <ProgressBar currentStep={3} totalSteps={7} label="Step 3: Finances" />

      <Text className="text-2xl font-black text-slate-900 mb-1">
        Career & Financial Readiness
      </Text>
      <Text className="text-sm text-slate-500 mb-5">
        To ensure intentional life commitments, financial brackets are assessed confidentially by pastoral counselors.
      </Text>

      {/* Privacy Firewall Callout Banner */}
      <Card className="mb-6 bg-blue-50/60 border border-blue-200">
        <View className="flex-row items-center mb-2">
          <ShieldCheck size={20} color="#2563EB" />
          <Text className="ml-2 text-sm font-bold text-blue-900">
            Privacy Firewall Protected
          </Text>
        </View>
        <Text className="text-xs text-blue-800 leading-relaxed">
          Your income bracket is strictly concealed from prospective matches and church administrators. It is only accessible to your assigned counselor for marriage readiness guidance.
        </Text>
      </Card>

      {/* Occupation Input */}
      <Input
        label="Primary Occupation / Profession"
        placeholder="e.g. Software Engineer, Architect, Doctor"
        leftIcon={<Briefcase size={18} color="#64748B" />}
        value={occupation}
        onChangeText={(text) => {
          setOccupation(text);
          if (errors.occupation) setErrors({ ...errors, occupation: "" });
        }}
        error={errors.occupation}
      />

      {/* Date of Birth */}
      <Input
        label="Date of Birth (YYYY-MM-DD)"
        placeholder="e.g. 1995-06-15"
        leftIcon={<Calendar size={18} color="#64748B" />}
        value={dateOfBirth}
        onChangeText={(text) => {
          setDateOfBirth(text);
          if (errors.dateOfBirth) setErrors({ ...errors, dateOfBirth: "" });
        }}
        error={errors.dateOfBirth}
      />

      {/* Standardized Salary Ratio Picker */}
      <Text className="text-sm font-bold text-slate-900 mt-2 mb-2">
        Monthly Income Bracket
      </Text>

      <View className="gap-3 mb-6">
        {SALARY_OPTIONS.map((option) => {
          const isSelected = salaryRange === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => setSalaryRange(option.value)}
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
                  <View className="flex-row items-center flex-1">
                    <View
                      className={`mr-3 rounded-2xl p-2.5 ${
                        isSelected ? "bg-blue-600" : "bg-slate-100"
                      }`}
                    >
                      <DollarSign
                        size={18}
                        color={isSelected ? "#FFFFFF" : "#64748B"}
                      />
                    </View>
                    <View>
                      <Text className="text-sm font-bold text-slate-900">
                        {option.label}
                      </Text>
                      <Text className="text-xs text-slate-500 mt-0.5">
                        {option.description}
                      </Text>
                    </View>
                  </View>
                  {isSelected && <Badge label="Selected" variant="primary" />}
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </View>

      <Button
        title="Continue to Identity Verification"
        isLoading={isSaving}
        onPress={handleContinue}
        className="mb-8"
      />
    </ScreenWrapper>
  );
}
