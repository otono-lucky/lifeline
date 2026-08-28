// types/index.ts
// Shared TypeScript definitions for Mobile Client

export type UserRole = "SuperAdmin" | "ChurchAdmin" | "Counselor" | "User";

export type UserVettingStatus =
  | "DRAFT"
  | "PENDING_VETTING"
  | "VETTED_ACTIVE"
  | "REJECTED"
  | "HARD_BLOCKED"
  | "DEBRIEF_REQUIRED";

export type MatchPreferenceType =
  | "my_church"
  | "my_church_plus"
  | "other_churches";

export type ChurchModelType = "PARENT_BRANCH" | "INDIVIDUAL_PARISH";

export type SalaryRange =
  | "RANGE_0_100K"
  | "RANGE_100K_500K"
  | "RANGE_500K_1M"
  | "RANGE_1M_PLUS";

export type SubscriptionTierType = "free" | "premium";
export type SubscriptionPlanInterval = "MONTHLY" | "YEARLY";
export type SubscriptionStatusType =
  | "active"
  | "past_due"
  | "expired"
  | "canceled";

export interface UserPhoto {
  id: string;
  photoUrl: string;
  order: number;
}

export interface SocialMediaHandle {
  id: string;
  platform: "LinkedIn" | "Instagram" | "Facebook" | string;
  handleOrUrl: string;
}

export interface UserProfile {
  id: string;
  accountId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  whatsappNumber?: string;
  gender: string;
  role: UserRole;
  dateOfBirth?: string;
  occupation?: string;
  salaryRange?: SalaryRange;
  originCountry?: string;
  originState?: string;
  originLga?: string;
  residenceCountry?: string;
  residenceState?: string;
  residenceCity?: string;
  residenceAddress?: string;
  residenceFormattedAddress?: string;
  residenceLatitude?: number;
  residenceLongitude?: number;
  residencePlaceId?: string;
  churchId?: string;
  churchName?: string;
  branchName?: string;
  matchPreference?: MatchPreferenceType;
  videoIntroUrl?: string;
  videoDurationSeconds?: number;
  photos: UserPhoto[];
  socials: SocialMediaHandle[];
  isVerified: boolean;
  vettingStatus: UserVettingStatus;
  profileCompletionPercentage: number;
  isDiscoveryIndexed: boolean;
  subscriptionTier: SubscriptionTierType;
  subscriptionInterval?: SubscriptionPlanInterval;
  subscriptionStatus?: SubscriptionStatusType;
  subscriptionExpiresAt?: string;
  verificationNotes?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface CandidateProfile {
  id: string;
  accountId: string;
  firstName: string;
  lastName: string;
  gender: string;
  age?: number;
  occupation?: string;
  interests?: string[];
  churchName?: string;
  branchName?: string;
  residenceCity?: string;
  residenceState?: string;
  photos: UserPhoto[];
  videoIntroUrl?: string;
  distanceKm?: number;
  isSameChurch: boolean;
  isSameDenomination: boolean;
  compatibilityScore?: number;
}

export interface MatchRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED" | "SUPERSEDED";
  createdAt: string;
  updatedAt: string;
  receiver?: CandidateProfile;
  sender?: CandidateProfile;
}

export interface ConversationParticipant {
  id: string;
  userId: string;
  role: string;
  user: {
    firstName: string;
    lastName: string;
    photos: UserPhoto[];
  };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface Conversation {
  id: string;
  type: "COUPLE_PRIVATE" | "COUNSELOR_GROUP";
  matchId?: string;
  title?: string;
  updatedAt: string;
  lastMessage?: Message;
  participants: ConversationParticipant[];
}

export interface CalendarEvent {
  id: string;
  matchId: string;
  createdById: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  meetingLink?: string;
  status: "PROPOSED" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  errors?: any;
}
