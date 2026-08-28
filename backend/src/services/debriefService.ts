import { prisma } from "../config/db";

export const endRelationshipMatch = async (
  requesterAccountId: string,
  matchId: string,
  reason?: string,
) => {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      participants: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!match) {
    throw new Error("Match not found");
  }

  // Update match status and transition users to DEBRIEF_REQUIRED
  await prisma.$transaction(async (tx) => {
    await tx.match.update({
      where: { id: matchId },
      data: {
        status: "ENDED",
        endedAt: new Date(),
      },
    });

    for (const participant of match.participants) {
      await tx.user.update({
        where: { id: participant.userId },
        data: {
          vettingStatus: "DEBRIEF_REQUIRED",
          isDiscoveryIndexed: false,
        },
      });
    }
  });

  return {
    success: true,
    message: "Relationship concluded. Both participants must undergo a counselor debrief before re-entering discovery.",
  };
};

export const resetUserAfterDebrief = async (
  counselorAccountId: string,
  userAccountId: string,
  data: {
    matchId?: string;
    notes: string;
    readinessScore?: number;
  },
) => {
  const counselor = await prisma.counselor.findUnique({
    where: { accountId: counselorAccountId },
    select: { id: true },
  });

  if (!counselor) {
    throw new Error("Counselor not found");
  }

  const user = await prisma.user.findUnique({
    where: { accountId: userAccountId },
    select: { id: true, vettingStatus: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create debrief log
    const debrief = await tx.counselorDebrief.create({
      data: {
        counselorId: counselor.id,
        userId: user.id,
        matchId: data.matchId || null,
        notes: data.notes,
        readinessScore: data.readinessScore || 10,
        clearedForDiscoveryAt: new Date(),
      },
    });

    // 2. Re-index user in discovery pool
    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: {
        vettingStatus: "VETTED_ACTIVE",
        isDiscoveryIndexed: true,
      },
    });

    return { debrief, updatedUser };
  });

  return {
    success: true,
    message: "Debrief completed successfully. Member has been re-indexed into the discovery pool.",
    debriefId: result.debrief.id,
    vettingStatus: result.updatedUser.vettingStatus,
  };
};
