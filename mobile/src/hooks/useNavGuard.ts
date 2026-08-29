// hooks/useNavGuard.ts
// Global Navigation Guard enforcing Zone boundaries and Gated State Machine

import { useEffect } from "react";
import { useRouter, useSegments, useRootNavigationState } from "expo-router";
import { useAuth } from "../context/AuthContext";

export function useNavGuard() {
  const router = useRouter();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();
  const { isLoading, isAuthenticated, isProfileComplete, vettingStatus } = useAuth();

  useEffect(() => {
    // Wait until root navigation container is mounted and auth state is initialized
    if (!rootNavigationState?.key || isLoading) return;

    const rootSegment = segments[0] as string | undefined;

    const inAuthGroup = rootSegment === "(auth)";
    const inOnboardingGroup = rootSegment === "(onboarding)";
    const inVettingGroup = rootSegment === "(vetting)";
    const inAppGroup = rootSegment === "(app)";

    // 1. Unauthenticated -> Must be in Auth Group
    if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace("/(auth)/lead-register" as any);
      }
      return;
    }

    // 2. Authenticated but Incomplete Profile (< 100%) -> Must be in Onboarding Group
    if (!isProfileComplete) {
      if (!inOnboardingGroup) {
        router.replace("/(onboarding)/church-selection" as any);
      }
      return;
    }

    // 3. Authenticated & 100% Complete, but not VETTED_ACTIVE -> Must be in Vetting Group
    if (vettingStatus !== "VETTED_ACTIVE") {
      const currentVettingScreen = segments[1] as string | undefined;

      switch (vettingStatus) {
        case "PENDING_VETTING":
          if (!inVettingGroup || currentVettingScreen !== "pending") {
            router.replace("/(vetting)/pending" as any);
          }
          break;
        case "REJECTED":
          if (!inVettingGroup || currentVettingScreen !== "rejected") {
            router.replace("/(vetting)/rejected" as any);
          }
          break;
        case "HARD_BLOCKED":
          if (!inVettingGroup || currentVettingScreen !== "blocked") {
            router.replace("/(vetting)/blocked" as any);
          }
          break;
        case "DEBRIEF_REQUIRED":
          if (!inVettingGroup || currentVettingScreen !== "debrief") {
            router.replace("/(vetting)/debrief" as any);
          }
          break;
        default:
          if (!inVettingGroup || currentVettingScreen !== "pending") {
            router.replace("/(vetting)/pending" as any);
          }
          break;
      }
      return;
    }

    // 4. Authenticated, 100% Complete, and VETTED_ACTIVE -> Must be in App Group
    if (inAuthGroup || inOnboardingGroup || inVettingGroup) {
      router.replace("/(app)/(tabs)/discovery" as any);
    }
  }, [
    rootNavigationState?.key,
    isLoading,
    isAuthenticated,
    isProfileComplete,
    vettingStatus,
    segments,
  ]);
}

export default useNavGuard;
