import { MatchDecision, MatchStatus } from "@prisma/client";
import { prisma } from "../config/db";

const ACTIVE_MATCH_STATUSES: MatchStatus[] = [
  "AWAITING_DECISIONS",
  "WAITING_FOR_OTHER",
  "MUTUAL_ACCEPTED",
  "IN_CONVERSATION",
  "COURTSHIP",
];

const DECISION_OPEN_STATUSES: MatchStatus[] = [
  "AWAITING_DECISIONS",
  "WAITING_FOR_OTHER",
];

const ELEVATED_ROLES = ["SuperAdmin", "ChurchAdmin", "Counselor"] as const;

const isElevatedRole = (role?: string | null) =>
  Boolean(role && ELEVATED_ROLES.includes(role as any));

const calculateAge = (dateOfBirth?: Date | null) => {
  if (!dateOfBirth) return null;
  const now = new Date();
  let age = now.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = now.getMonth() - dateOfBirth.getMonth();
  const dayDiff = now.getDate() - dateOfBirth.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }
  return age;
};

const getUserByAccountId = async (accountId: string) => {
  const user = await prisma.user.findUnique({
    where: { accountId },
    include: {
      account: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      socialMediaHandles: {
        select: {
          id: true,
          platform: true,
          handleOrUrl: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
      church: {
        select: {
          id: true,
          officialName: true,
          aka: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

const hasActiveMatch = async (userId: string) => {
  const active = await prisma.matchParticipant.findFirst({
    where: {
      userId,
      match: {
        status: { in: ACTIVE_MATCH_STATUSES },
      },
    },
    select: { id: true },
  });
  return Boolean(active);
};

const getEligibilityFromUser = (user: {
  isVerified: boolean;
  socialMediaHandles: Array<{ id: string }>;
}) => {
  const handleCount = user.socialMediaHandles.length;
  return {
    isEligible: user.isVerified && handleCount >= 2 && handleCount <= 4,
    reasons: [
      ...(user.isVerified ? [] : ["User must be verified by a counselor"]),
      ...(handleCount < 2
        ? ["User must have at least 2 social media handles"]
        : []),
      ...(handleCount > 4
        ? ["User cannot have more than 4 social media handles"]
        : []),
    ],
  };
};

const deriveMatchStatus = (
  decisions: MatchDecision[],
  currentStatus: MatchStatus,
): MatchStatus => {
  if (decisions.some((d) => d === "DECLINED")) {
    return "DECLINED";
  }
  if (decisions.every((d) => d === "ACCEPTED")) {
    return "MUTUAL_ACCEPTED";
  }
  if (decisions.some((d) => d === "ACCEPTED") && decisions.includes("PENDING")) {
    return "WAITING_FOR_OTHER";
  }
  if (decisions.every((d) => d === "PENDING")) {
    return "AWAITING_DECISIONS";
  }
  return currentStatus;
};

export const getMatchingEligibility = async (accountId: string) => {
  const user = await prisma.user.findUnique({
    where: { accountId },
    select: {
      id: true,
      isVerified: true,
      socialMediaHandles: {
        select: { id: true },
      },
      matchParticipations: {
        where: {
          match: {
            status: { in: ACTIVE_MATCH_STATUSES },
          },
        },
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const eligibility = getEligibilityFromUser(user);

  return {
    ...eligibility,
    hasActiveMatch: user.matchParticipations.length > 0,
  };
};

export const createManualMatch = async (
  requesterAccountId: string,
  maleAccountId: string,
  femaleAccountId: string,
) => {
  if (maleAccountId === femaleAccountId) {
    throw new Error("A match must include two distinct users");
  }

  const [requester, maleUser, femaleUser] = await Promise.all([
    prisma.account.findUnique({
      where: { id: requesterAccountId },
      include: {
        counselor: { select: { id: true } },
        churchAdmin: { select: { id: true } },
        superAdmin: { select: { id: true } },
      },
    }),
    getUserByAccountId(maleAccountId),
    getUserByAccountId(femaleAccountId),
  ]);

  if (!requester) {
    throw new Error("Requester not found");
  }

  if (!requester.counselor && !requester.churchAdmin && !requester.superAdmin) {
    throw new Error("You are not allowed to create matches");
  }

  if (maleUser.gender !== "Male" || femaleUser.gender !== "Female") {
    throw new Error("Manual match requires one Male user and one Female user");
  }

  const [maleEligibility, femaleEligibility] = await Promise.all([
    getMatchingEligibility(maleAccountId),
    getMatchingEligibility(femaleAccountId),
  ]);

  if (!maleEligibility.isEligible) {
    throw new Error(`Male user is not eligible: ${maleEligibility.reasons.join(", ")}`);
  }
  if (!femaleEligibility.isEligible) {
    throw new Error(
      `Female user is not eligible: ${femaleEligibility.reasons.join(", ")}`,
    );
  }
  if (maleEligibility.hasActiveMatch || femaleEligibility.hasActiveMatch) {
    throw new Error("One or both users already have an active match");
  }

  const match = await prisma.$transaction(async (tx) => {
    const createdMatch = await tx.match.create({
      data: {
        status: "AWAITING_DECISIONS",
        counselorId: requester.counselor?.id ?? null,
      },
    });

    await tx.matchParticipant.createMany({
      data: [
        { matchId: createdMatch.id, userId: maleUser.id, decision: "PENDING" },
        { matchId: createdMatch.id, userId: femaleUser.id, decision: "PENDING" },
      ],
    });

    return createdMatch;
  });

  return {
    id: match.id,
    status: match.status,
    createdAt: match.createdAt,
    participants: [
      {
        accountId: maleUser.account.id,
        firstName: maleUser.account.firstName,
        lastName: maleUser.account.lastName,
        email: maleUser.account.email,
      },
      {
        accountId: femaleUser.account.id,
        firstName: femaleUser.account.firstName,
        lastName: femaleUser.account.lastName,
        email: femaleUser.account.email,
      },
    ],
  };
};

export const getActiveMatchForUser = async (accountId: string) => {
  const user = await getUserByAccountId(accountId);

  const participant = await prisma.matchParticipant.findFirst({
    where: {
      userId: user.id,
      match: {
        status: { in: ACTIVE_MATCH_STATUSES },
      },
    },
    orderBy: { match: { createdAt: "desc" } },
    include: {
      match: {
        include: {
          participants: {
            include: {
              user: {
                include: {
                  account: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                    },
                  },
                  socialMediaHandles: {
                    select: {
                      platform: true,
                      handleOrUrl: true,
                    },
                    orderBy: { createdAt: "desc" },
                  },
                  church: {
                    select: {
                      id: true,
                      officialName: true,
                      aka: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!participant) {
    return null;
  }

  const otherParticipant = participant.match.participants.find(
    (p) => p.userId !== user.id,
  );

  return {
    id: participant.match.id,
    status: participant.match.status,
    createdAt: participant.match.createdAt,
    endedAt: participant.match.endedAt,
    myDecision: participant.decision,
    waitingForOther:
      participant.match.status === "WAITING_FOR_OTHER" &&
      participant.decision === "ACCEPTED",
    canDecide:
      DECISION_OPEN_STATUSES.includes(participant.match.status) &&
      participant.decision === "PENDING",
    participant: otherParticipant
      ? {
          accountId: otherParticipant.user.account.id,
          userId: otherParticipant.user.id,
          firstName: otherParticipant.user.account.firstName,
          lastName: otherParticipant.user.account.lastName,
          email: otherParticipant.user.account.email,
          age: calculateAge(otherParticipant.user.dateOfBirth),
          gender: otherParticipant.user.gender,
          profilePictureUrl: otherParticipant.user.profilePictureUrl,
          videoIntroUrl: otherParticipant.user.videoIntroUrl,
          occupation: otherParticipant.user.occupation,
          interests: otherParticipant.user.interests,
          matchPreference: otherParticipant.user.matchPreference,
          origin: {
            country: otherParticipant.user.originCountry,
            state: otherParticipant.user.originState,
            lga: otherParticipant.user.originLga,
          },
          residence: {
            country: otherParticipant.user.residenceCountry,
            state: otherParticipant.user.residenceState,
            city: otherParticipant.user.residenceCity,
            address: otherParticipant.user.residenceAddress,
          },
          church: otherParticipant.user.church,
          socialMedia: otherParticipant.user.socialMediaHandles,
        }
      : null,
  };
};

export const getMatchHistoryForUser = async (accountId: string) => {
  const user = await getUserByAccountId(accountId);

  const rows = await prisma.matchParticipant.findMany({
    where: { userId: user.id },
    orderBy: { match: { createdAt: "desc" } },
    include: {
      match: {
        include: {
          participants: {
            include: {
              user: {
                include: {
                  account: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return rows.map((row) => {
    const otherParticipant = row.match.participants.find((p) => p.userId !== user.id);
    return {
      id: row.match.id,
      status: row.match.status,
      createdAt: row.match.createdAt,
      endedAt: row.match.endedAt,
      myDecision: row.decision,
      participant: otherParticipant
        ? {
            accountId: otherParticipant.user.account.id,
            firstName: otherParticipant.user.account.firstName,
            lastName: otherParticipant.user.account.lastName,
            email: otherParticipant.user.account.email,
          }
        : null,
    };
  });
};

export const getMatchById = async (
  requesterAccountId: string,
  requesterRole: string,
  matchId: string,
) => {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      counselor: {
        select: {
          id: true,
          account: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      participants: {
        include: {
          user: {
            include: {
              account: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              church: {
                select: {
                  id: true,
                  officialName: true,
                  aka: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!match) {
    throw new Error("Match not found");
  }

  if (!isElevatedRole(requesterRole)) {
    const isParticipant = match.participants.some(
      (p) => p.user.account.id === requesterAccountId,
    );
    if (!isParticipant) {
      throw new Error("You are not allowed to view this match");
    }
  }

  return {
    id: match.id,
    status: match.status,
    createdAt: match.createdAt,
    endedAt: match.endedAt,
    compatibilityScore: match.compatibilityScore,
    counselor: match.counselor
      ? {
          id: match.counselor.id,
          accountId: match.counselor.account.id,
          firstName: match.counselor.account.firstName,
          lastName: match.counselor.account.lastName,
          email: match.counselor.account.email,
        }
      : null,
    participants: match.participants.map((participant) => ({
      id: participant.id,
      userId: participant.user.id,
      accountId: participant.user.account.id,
      firstName: participant.user.account.firstName,
      lastName: participant.user.account.lastName,
      email: participant.user.account.email,
      age: calculateAge(participant.user.dateOfBirth),
      gender: participant.user.gender,
      profilePictureUrl: participant.user.profilePictureUrl,
      decision: participant.decision,
      feedback: participant.feedback,
      notes: participant.notes,
      church: participant.user.church,
      residence: {
        country: participant.user.residenceCountry,
        state: participant.user.residenceState,
        city: participant.user.residenceCity,
      },
      occupation: participant.user.occupation,
      interests: participant.user.interests,
    })),
  };
};

export const decideMatch = async (
  accountId: string,
  matchId: string,
  decision: MatchDecision,
  feedback?: string,
) => {
  if (decision === "DECLINED" && !feedback) {
    throw new Error("Feedback is required when declining a match");
  }

  const user = await getUserByAccountId(accountId);

  const existing = await prisma.matchParticipant.findFirst({
    where: {
      matchId,
      userId: user.id,
    },
    include: {
      match: true,
    },
  });

  if (!existing) {
    throw new Error("Match participant not found");
  }

  if (!DECISION_OPEN_STATUSES.includes(existing.match.status)) {
    throw new Error("This match no longer accepts decisions");
  }

  if (existing.decision !== "PENDING") {
    throw new Error("You have already submitted a decision for this match");
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.matchParticipant.update({
      where: { id: existing.id },
      data: {
        decision,
        feedback: decision === "DECLINED" ? feedback : null,
      },
    });

    const participants = await tx.matchParticipant.findMany({
      where: { matchId },
      select: {
        decision: true,
      },
    });

    const nextStatus = deriveMatchStatus(
      participants.map((p) => p.decision),
      existing.match.status,
    );

    const updatedMatch = await tx.match.update({
      where: { id: matchId },
      data: {
        status: nextStatus,
        endedAt:
          nextStatus === "DECLINED" || nextStatus === "EXPIRED" || nextStatus === "MARRIED"
            ? new Date()
            : null,
      },
      select: {
        id: true,
        status: true,
        endedAt: true,
      },
    });

    return updatedMatch;
  });

  return result;
};

export const getMatchPublicProfile = async (
  viewerAccountId: string,
  targetAccountId: string,
) => {
  const [viewer, target] = await Promise.all([
    getUserByAccountId(viewerAccountId),
    getUserByAccountId(targetAccountId),
  ]);

  const matchExists = await prisma.matchParticipant.findFirst({
    where: {
      userId: viewer.id,
      match: {
        participants: {
          some: {
            userId: target.id,
          },
        },
      },
    },
    select: { id: true },
  });

  if (!matchExists) {
    throw new Error("You can only view public profile for matched users");
  }

  return {
    accountId: target.account.id,
    firstName: target.account.firstName,
    lastName: target.account.lastName,
    age: calculateAge(target.dateOfBirth),
    gender: target.gender,
    occupation: target.occupation || null,
    interests: target.interests || null,
    matchPreference: target.matchPreference,
    origin: {
      country: target.originCountry,
      state: target.originState,
      lga: target.originLga,
    },
    residence: {
      country: target.residenceCountry,
      state: target.residenceState,
      city: target.residenceCity,
      address: target.residenceAddress,
    },
    profilePictureUrl: target.profilePictureUrl,
    videoIntroUrl: target.videoIntroUrl,
    church: target.church
      ? {
          id: target.church.id,
          officialName: target.church.officialName,
          aka: target.church.aka,
        }
      : null,
    socialMedia: target.socialMediaHandles.map((s) => ({
      platform: s.platform,
      handleOrUrl: s.handleOrUrl,
    })),
  };
};

export const getMatchPublicProfileForMatch = async (
  viewerAccountId: string,
  viewerRole: string,
  matchId: string,
  targetAccountId: string,
) => {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      participants: {
        include: {
          user: {
            include: {
              account: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
              socialMediaHandles: {
                select: {
                  platform: true,
                  handleOrUrl: true,
                },
                orderBy: { createdAt: "desc" },
              },
              church: {
                select: {
                  id: true,
                  officialName: true,
                  aka: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!match) {
    throw new Error("Match not found");
  }

  const participantAccountIds = match.participants.map(
    (p) => p.user.account.id,
  );

  const isParticipant = participantAccountIds.includes(viewerAccountId);
  if (!isElevatedRole(viewerRole) && !isParticipant) {
    throw new Error("You can only view public profile for matched users");
  }

  const targetParticipant = match.participants.find(
    (p) => p.user.account.id === targetAccountId,
  );

  if (!targetParticipant) {
    throw new Error("Target user is not a participant in this match");
  }

  const target = targetParticipant.user;

  return {
    accountId: target.account.id,
    firstName: target.account.firstName,
    lastName: target.account.lastName,
    age: calculateAge(target.dateOfBirth),
    gender: target.gender,
    occupation: target.occupation || null,
    interests: target.interests || null,
    matchPreference: target.matchPreference,
    origin: {
      country: target.originCountry,
      state: target.originState,
      lga: target.originLga,
    },
    residence: {
      country: target.residenceCountry,
      state: target.residenceState,
      city: target.residenceCity,
      address: target.residenceAddress,
    },
    profilePictureUrl: target.profilePictureUrl,
    videoIntroUrl: target.videoIntroUrl,
    church: target.church,
    socialMedia: target.socialMediaHandles.map((s) => ({
      platform: s.platform,
      handleOrUrl: s.handleOrUrl,
    })),
  };
};

export const listMatches = async (filters?: {
  status?: MatchStatus;
  createdBy?: string;
  counselorId?: string;
  churchId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}) => {
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;

  let resolvedCounselorId = filters?.counselorId;
  if (!resolvedCounselorId && filters?.createdBy) {
    const counselor = await prisma.counselor.findUnique({
      where: { accountId: filters.createdBy },
      select: { id: true },
    });
    resolvedCounselorId = counselor?.id || filters.createdBy;
  }

  const where: any = {};

  if (filters?.status) {
    where.status = filters.status;
  }

  if (resolvedCounselorId) {
    where.counselorId = resolvedCounselorId;
  }

  if (filters?.dateFrom || filters?.dateTo) {
    where.createdAt = {
      ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
      ...(filters.dateTo ? { lte: filters.dateTo } : {}),
    };
  }

  if (filters?.churchId) {
    where.participants = {
      some: {
        user: {
          churchId: filters.churchId,
        },
      },
    };
  }

  const [rows, total] = await Promise.all([
    prisma.match.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        participants: {
          include: {
            user: {
              include: {
                account: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.match.count({ where }),
  ]);

  return {
    matches: rows.map((match) => ({
      id: match.id,
      status: match.status,
      createdAt: match.createdAt,
      endedAt: match.endedAt,
      compatibilityScore: match.compatibilityScore,
      counselorId: match.counselorId,
      participants: match.participants.map((participant) => ({
        accountId: participant.user.account.id,
        firstName: participant.user.account.firstName,
        lastName: participant.user.account.lastName,
        decision: participant.decision,
      })),
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const findRandomCounselorId = async (churchId?: string | null) => {
  const counselors = await prisma.counselor.findMany({
    where: churchId ? { churchId } : undefined,
    select: { id: true },
  });

  if (!counselors.length) {
    return null;
  }

  const index = Math.floor(Math.random() * counselors.length);
  return counselors[index].id;
};

export { ACTIVE_MATCH_STATUSES };
