import { prisma } from "../config/db";
import { calculateProfileCompletion } from "../utils/profileCompletion";

export const reviewUserVetting = async (
  counselorAccountId: string,
  userAccountId: string,
  decision: "APPROVE" | "REJECT" | "HARD_BLOCK",
  reason?: string,
  notes?: string,
) => {
  const counselor = await prisma.counselor.findUnique({
    where: { accountId: counselorAccountId },
    select: { id: true },
  });

  if (!counselor) {
    throw new Error("Counselor profile not found");
  }

  const user = await prisma.user.findUnique({
    where: { accountId: userAccountId },
    include: {
      photos: true,
      socialMediaHandles: true,
    },
  });

  if (!user) {
    throw new Error("User profile not found");
  }

  if (decision === "APPROVE") {
    // Check 100% profile gate
    const completion = calculateProfileCompletion({
      ...user,
      photos: user.photos,
      socialMediaHandles: user.socialMediaHandles,
    });

    if (!completion.isComplete) {
      throw new Error(
        `Cannot approve user: Profile is only ${completion.percentage}% complete. Missing: ${completion.missingFields.join(", ")}`,
      );
    }
  }

  if ((decision === "REJECT" || decision === "HARD_BLOCK") && !reason) {
    throw new Error("A reason must be logged when rejecting or hard-blocking a profile");
  }

  const nextStatus =
    decision === "APPROVE"
      ? "VETTED_ACTIVE"
      : decision === "REJECT"
      ? "REJECTED"
      : "HARD_BLOCKED";

  const updatedUser = await prisma.$transaction(async (tx) => {
    const u = await tx.user.update({
      where: { id: user.id },
      data: {
        vettingStatus: nextStatus,
        isVerified: decision === "APPROVE",
        isDiscoveryIndexed: decision === "APPROVE",
        verifiedAt: decision === "APPROVE" ? new Date() : null,
        verificationNotes: notes || reason || null,
      },
      include: {
        account: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    await tx.vettingLog.create({
      data: {
        userId: user.id,
        counselorId: counselor.id,
        action: decision,
        reason: reason || null,
        notes: notes || null,
      },
    });

    return u;
  });

  return {
    userId: updatedUser.id,
    name: `${updatedUser.account.firstName} ${updatedUser.account.lastName}`,
    email: updatedUser.account.email,
    vettingStatus: updatedUser.vettingStatus,
    isDiscoveryIndexed: updatedUser.isDiscoveryIndexed,
  };
};

export const submitAppealRequest = async (
  userAccountId: string,
  appealReason: string,
) => {
  const user = await prisma.user.findUnique({
    where: { accountId: userAccountId },
  });

  if (!user) throw new Error("User not found");

  if (user.vettingStatus !== "HARD_BLOCKED") {
    throw new Error("Appeals can only be submitted for hard-blocked accounts");
  }

  const appeal = await prisma.appealRequest.create({
    data: {
      userId: user.id,
      appealReason,
      status: "PENDING",
    },
  });

  return appeal;
};

export const reviewAppealRequest = async (
  superAdminAccountId: string,
  appealId: string,
  status: "APPROVED" | "REJECTED",
) => {
  const superAdmin = await prisma.superAdmin.findUnique({
    where: { accountId: superAdminAccountId },
  });

  if (!superAdmin) throw new Error("Unauthorized: SuperAdmin required");

  const appeal = await prisma.appealRequest.findUnique({
    where: { id: appealId },
    include: { user: true },
  });

  if (!appeal) throw new Error("Appeal request not found");

  await prisma.$transaction(async (tx) => {
    await tx.appealRequest.update({
      where: { id: appealId },
      data: {
        status,
        reviewedBySuperAdminId: superAdmin.id,
      },
    });

    if (status === "APPROVED") {
      // Unblock user and place them back in PENDING_VETTING
      await tx.user.update({
        where: { id: appeal.userId },
        data: {
          vettingStatus: "PENDING_VETTING",
        },
      });
    }
  });

  return {
    appealId,
    status,
    userId: appeal.userId,
  };
};
