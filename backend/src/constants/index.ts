export const STATUS_TYPES = ["pending", "active", "suspended", "deleted"] as const;

export const SALARY_RANGES = [
  "RANGE_0_100K",
  "RANGE_100K_500K",
  "RANGE_500K_1M",
  "RANGE_1M_PLUS",
] as const;

export const SOCIAL_PLATFORM_OPTIONS = [
  "LinkedIn",
  "Instagram",
  "Facebook",
] as const;

export const MATCH_PREFERENCE_OPTIONS = [
  "my_church",
  "my_church_plus",
  "other_churches",
] as const;

export const MAX_ACTIVE_REQUEST_SLOTS = 3;
export const REQUIRED_PHOTOS_COUNT = 3;
export const MAX_VIDEO_DURATION_SECONDS = 60;
export const MIN_SOCIAL_HANDLES_REQUIRED = 2; // "2-of-3" rule