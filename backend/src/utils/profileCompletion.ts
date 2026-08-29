import {
  MatchPreferenceType,
  SalaryRange,
  UserVettingStatus,
} from "@prisma/client";
import {
  MIN_SOCIAL_HANDLES_REQUIRED,
  REQUIRED_PHOTOS_COUNT,
  SOCIAL_PLATFORM_OPTIONS,
} from "../constants";

export interface ProfileInputUser {
  dateOfBirth?: Date | null;
  gender?: string | null;
  originCountry?: string | null;
  originState?: string | null;
  originLga?: string | null;
  residenceCountry?: string | null;
  residenceState?: string | null;
  residenceCity?: string | null;
  residenceAddress?: string | null;
  residenceLatitude?: number | null;
  residenceLongitude?: number | null;
  occupation?: string | null;
  salaryRange?: SalaryRange | null;
  interests?: unknown;
  matchPreference?: MatchPreferenceType | null;
  videoIntroUrl?: string | null;
  videoDurationSeconds?: number | null;
  churchId?: string | null;
  whatsappNumber?: string | null;
  photos?: Array<{ id?: string; order: number }>;
  socialMediaHandles?: Array<{ platform: string; handleOrUrl: string }>;
}

const isNonEmptyString = (val?: string | null) =>
  typeof val === "string" && val.trim().length > 0;

export const calculateProfileCompletion = (user: ProfileInputUser) => {
  const missingFields: string[] = [];

  // Criteria breakdown & weights
  const checks = [
    {
      name: "Gender",
      passed: Boolean(user.gender),
      weight: 5,
    },
    {
      name: "Date of Birth",
      passed: Boolean(user.dateOfBirth),
      weight: 5,
    },
    {
      name: "Origin Location (Country, State, LGA)",
      passed:
        isNonEmptyString(user.originCountry) &&
        isNonEmptyString(user.originState) &&
        isNonEmptyString(user.originLga),
      weight: 10,
    },
    {
      name: "Residence Location & Map Geocoding",
      passed:
        isNonEmptyString(user.residenceCountry) &&
        isNonEmptyString(user.residenceState) &&
        isNonEmptyString(user.residenceCity) &&
        isNonEmptyString(user.residenceAddress),
      weight: 10,
    },
    {
      name: "Church Selection",
      passed: isNonEmptyString(user.churchId),
      weight: 10,
    },
    {
      name: "Occupation",
      passed: isNonEmptyString(user.occupation),
      weight: 5,
    },
    {
      name: "Standardized Salary Range",
      passed: Boolean(user.salaryRange),
      weight: 10,
    },
    {
      name: "Interests (at least 3)",
      passed: Array.isArray(user.interests) && user.interests.length >= 3,
      weight: 10,
    },
    {
      name: "Match Preference",
      passed: Boolean(user.matchPreference),
      weight: 5,
    },
    {
      name: "WhatsApp Number",
      passed: isNonEmptyString(user.whatsappNumber),
      weight: 5,
    },
    {
      name: `Exactly ${REQUIRED_PHOTOS_COUNT} Profile Photos`,
      passed: Array.isArray(user.photos) && user.photos.length === REQUIRED_PHOTOS_COUNT,
      weight: 15,
    },
    {
      name: "Introductory Video (< 1 minute)",
      // If videoDurationSeconds is stored, enforce the <=60s rule.
      // Fall back to URL presence only for legacy records without a stored duration.
      passed: isNonEmptyString(user.videoIntroUrl)
        ? user.videoDurationSeconds != null
          ? user.videoDurationSeconds <= 60
          : true
        : false,
      weight: 10,
    },
    {
      name: `2-of-3 Social Handles (${SOCIAL_PLATFORM_OPTIONS.join(", ")})`,
      passed: (() => {
        if (!Array.isArray(user.socialMediaHandles)) return false;
        const validPlatforms = user.socialMediaHandles.filter(
          (s) =>
            SOCIAL_PLATFORM_OPTIONS.includes(s.platform as any) &&
            isNonEmptyString(s.handleOrUrl),
        );
        const uniquePlatforms = new Set(validPlatforms.map((s) => s.platform));
        return uniquePlatforms.size >= MIN_SOCIAL_HANDLES_REQUIRED;
      })(),
      weight: 10,
    },
  ];

  let percentage = 0;
  for (const check of checks) {
    if (check.passed) {
      percentage += check.weight;
    } else {
      missingFields.push(check.name);
    }
  }

  // Cap percentage between 0 and 100
  percentage = Math.min(100, Math.max(0, percentage));
  const isComplete = percentage === 100;

  return {
    percentage,
    isComplete,
    missingFields,
  };
};
