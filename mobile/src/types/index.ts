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
  church?: string;
  churchName?: string;
  branchName?: string;
  matchPreference?: MatchPreferenceType;
  interests?: string[] | null;
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
  id: string;           // legacy, same as userId
  userId: string;       // User model PK — used for sendRequest
  accountId: string;    // Account model PK — used for profile navigation
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
  accountId: string;  // Account.id — matches ConversationParticipant.accountId FK
  roleInChat: string; // COUPLE_MEMBER | COUNSELOR | OBSERVER
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  isMe: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  /** Message.senderId → Account.id. Use this to compute isMe: senderId === user.accountId */
  senderId: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  readAt?: string;
  sender: {
    id: string;           // Account.id
    firstName: string;
    lastName: string;
    name: string;         // firstName + lastName combined
    role?: string;
    isMe: boolean;        // pre-computed by backend
  };
}

export interface Conversation {
  /** Canonical ID — always use this for navigation and API calls */
  id: string;
  /** Legacy alias for id — same value, kept for backward compatibility */
  conversationId: string;
  matchId: string;
  type: "COUPLE_PRIVATE" | "COUNSELOR_GROUP";
  roleInChat: string;
  updatedAt: string;
  createdAt: string;
  participants: ConversationParticipant[];
  lastMessage?: {
    id: string;
    senderId: string;
    content: string;
    mediaUrl?: string;
    senderName: string;
    isMe: boolean;
    createdAt: string;
  } | null;
}

export interface CalendarEvent {
  id: string;
  matchId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  meetingLink?: string;
  status: "PROPOSED" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  proposedBy: {
    accountId: string;
    name: string;
    isMe: boolean;
  };
  /** Display name of the other match participant */
  partnerName: string;
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
