// hooks/useNavGuard.ts
// Guard hook enforcing Zone rules on focus / state transition

import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "../context/AuthContext";

export type GuardZone = "auth" | "onboarding" | "vetting" | "app";

export function useNavGuard(zone: GuardZone) {
  const router = useRouter();
  const { isLoading, isAuthenticated, isProfileComplete, vettingStatus } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    // 1. In Auth Zone -> if authenticated, redirect forward
    if (zone === "auth") {
      if (isAuthenticated) {
        if (!isProfileComplete) {
          router.replace("/(onboarding)/church-selection" as any);
        } else if (vettingStatus === "VETTED_ACTIVE") {
          router.replace("/(app)/(tabs)/discovery" as any);
        } else {
          router.replace("/(vetting)/pending" as any);
        }
      }
      return;
    }

    // 2. Unauthenticated in protected zone -> send to login/register
    if (!isAuthenticated) {
      router.replace("/(auth)/lead-register" as any);
      return;
    }

    // 3. In Onboarding Zone
    if (zone === "onboarding") {
      if (isProfileComplete) {
        if (vettingStatus === "VETTED_ACTIVE") {
          router.replace("/(app)/(tabs)/discovery" as any);
        } else {
          router.replace("/(vetting)/pending" as any);
        }
      }
      return;
    }

    // 4. In Vetting Zone
    if (zone === "vetting") {
      if (!isProfileComplete) {
        router.replace("/(onboarding)/church-selection" as any);
        return;
      }
      if (vettingStatus === "VETTED_ACTIVE") {
        router.replace("/(app)/(tabs)/discovery" as any);
        return;
      }
      // Ensure the correct vetting screen is shown
      const currentRoute = segments[segments.length - 1];
      if (vettingStatus === "PENDING_VETTING" && currentRoute !== "pending") {
        router.replace("/(vetting)/pending" as any);
      } else if (vettingStatus === "REJECTED" && currentRoute !== "rejected") {
        router.replace("/(vetting)/rejected" as any);
      } else if (vettingStatus === "HARD_BLOCKED" && currentRoute !== "blocked") {
        router.replace("/(vetting)/blocked" as any);
      } else if (vettingStatus === "DEBRIEF_REQUIRED" && currentRoute !== "debrief") {
        router.replace("/(vetting)/debrief" as any);
      }
      return;
    }

    // 5. In App Zone
    if (zone === "app") {
      if (!isProfileComplete) {
        router.replace("/(onboarding)/church-selection" as any);
        return;
      }
      if (vettingStatus !== "VETTED_ACTIVE") {
        switch (vettingStatus) {
          case "PENDING_VETTING":
            router.replace("/(vetting)/pending" as any);
            break;
          case "REJECTED":
            router.replace("/(vetting)/rejected" as any);
            break;
          case "HARD_BLOCKED":
            router.replace("/(vetting)/blocked" as any);
            break;
          case "DEBRIEF_REQUIRED":
            router.replace("/(vetting)/debrief" as any);
            break;
          default:
            router.replace("/(vetting)/pending" as any);
            break;
        }
        return;
      }
    }
  }, [isLoading, isAuthenticated, isProfileComplete, vettingStatus, zone, segments]);
}

export default useNavGuard;
