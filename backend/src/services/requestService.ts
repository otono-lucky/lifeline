import { prisma } from "../config/db";
import { MAX_ACTIVE_REQUEST_SLOTS } from "../constants";
import { sendEmail } from "./emailService";

export const sendMatchRequest = async (
  senderAccountId: string,
  receiverUserId: string,
) => {
  const sender = await prisma.user.findUnique({
    where: { accountId: senderAccountId },
    include: {
      sentRequests: {
        where: { status: "PENDING" },
      },
    },
  });

  if (!sender) {
    throw new Error("Sender user profile not found");
  }

  if (sender.vettingStatus !== "VETTED_ACTIVE" || !sender.isDiscoveryIndexed) {
    throw new Error("You must be an active, vetted member in discovery to send match requests");
  }

  // 1. Enforce 3 active slots constraint
  if (sender.sentRequests.length >= MAX_ACTIVE_REQUEST_SLOTS) {
    throw new Error(
      `Request limit reached: You can only have up to ${MAX_ACTIVE_REQUEST_SLOTS} active requests at a time. Please wait for an outcome or cancel an existing request.`,
    );
  }

  if (sender.id === receiverUserId) {
    throw new Error("You cannot send a match request to yourself");
  }

  const receiver = await prisma.user.findUnique({
    where: { id: receiverUserId },
    include: {
      account: { select: { status: true, firstName: true } },
    },
  });

  if (!receiver || receiver.account.status !== "active") {
    throw new Error("Target prospect is not available");
  }

  if (receiver.gender === sender.gender) {
    throw new Error("Match requests must be sent to the opposite gender");
  }

  if (receiver.vettingStatus !== "VETTED_ACTIVE" || !receiver.isDiscoveryIndexed) {
    throw new Error("Target prospect is currently not active in discovery");
  }

  // 2. Check for existing active or pending request between parties
  const existingRequest = await prisma.matchRequest.findFirst({
    where: {
      OR: [
        { senderId: sender.id, receiverId: receiver.id },
        { senderId: receiver.id, receiverId: sender.id },
      ],
      status: { in: ["PENDING", "ACCEPTED"] },
    },
  });

  if (existingRequest) {
    throw new Error("An active request or match already exists with this person");
  }

  const createdRequest = await prisma.matchRequest.create({
    data: {
      senderId: sender.id,
      receiverId: receiver.id,
      status: "PENDING",
    },
    include: {
      receiver: {
        include: {
          account: {
            select: { firstName: true, lastName: true },
          },
        },
      },
    },
  });

  const slotsUsed = sender.sentRequests.length + 1;
  const slotsRemaining = MAX_ACTIVE_REQUEST_SLOTS - slotsUsed;

  return {
    requestId: createdRequest.id,
    status: createdRequest.status,
    slotsUsed,
    slotsRemaining,
    createdAt: createdRequest.createdAt,
  };
};

export const getSentMatchRequests = async (accountId: string) => {
  const user = await prisma.user.findUnique({
    where: { accountId },
    select: { id: true },
  });

  if (!user) throw new Error("User not found");

  const requests = await prisma.matchRequest.findMany({
    where: { senderId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      receiver: {
        include: {
          account: {
            select: { firstName: true, lastName: true },
          },
          photos: {
            where: { order: 1 },
            select: { url: true },
          },
          church: {
            select: { officialName: true },
          },
        },
      },
    },
  });

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return {
    slotsTotal: MAX_ACTIVE_REQUEST_SLOTS,
    slotsUsed: pendingCount,
    slotsRemaining: MAX_ACTIVE_REQUEST_SLOTS - pendingCount,
    requests: requests.map((r) => ({
      id: r.id,
      status: r.status,
      createdAt: r.createdAt,
      // Blind rejection: never reveal receiver identity on non-active requests
      receiver:
        r.status === "PENDING" || r.status === "ACCEPTED"
          ? {
              userId: r.receiver.id,
              firstName: r.receiver.account.firstName,
              lastNameInitial: r.receiver.account.lastName
                ? r.receiver.account.lastName.charAt(0) + "."
                : "",
              photoUrl: r.receiver.photos[0]?.url || null,
              church: r.receiver.church?.officialName || null,
            }
          : null,
    })),
  };
};

export const getReceivedMatchRequests = async (accountId: string) => {
  const user = await prisma.user.findUnique({
    where: { accountId },
    select: { id: true },
  });

  if (!user) throw new Error("User not found");

  const requests = await prisma.matchRequest.findMany({
    where: {
      receiverId: user.id,
      status: "PENDING",
    },
    orderBy: { createdAt: "desc" },
    include: {
      sender: {
        include: {
          account: {
            select: { firstName: true, lastName: true },
          },
          photos: {
            orderBy: { order: "asc" },
            select: { url: true },
          },
          church: {
            select: { officialName: true, state: true, city: true },
          },
        },
      },
    },
  });

  return requests.map((r) => ({
    id: r.id,
    createdAt: r.createdAt,
    sender: {
      userId: r.sender.id,
      firstName: r.sender.account.firstName,
      lastNameInitial: r.sender.account.lastName
        ? r.sender.account.lastName.charAt(0) + "."
        : "",
      occupation: r.sender.occupation,
      interests: r.sender.interests,
      residenceState: r.sender.residenceState,
      residenceCity: r.sender.residenceCity,
      photos: r.sender.photos.map((p) => p.url),
      videoIntroUrl: r.sender.videoIntroUrl,
      church: r.sender.church?.officialName || null,
    },
  }));
};

// Blind Rejection (Psychological Safety)
export const declineMatchRequest = async (
  receiverAccountId: string,
  requestId: string,
) => {
  const receiver = await prisma.user.findUnique({
    where: { accountId: receiverAccountId },
    select: { id: true },
  });

  if (!receiver) throw new Error("User not found");

  const request = await prisma.matchRequest.findUnique({
    where: { id: requestId },
  });

  if (!request || request.receiverId !== receiver.id) {
    throw new Error("Match request not found");
  }

  if (request.status !== "PENDING") {
    throw new Error("This request is no longer pending");
  }

  await prisma.matchRequest.update({
    where: { id: requestId },
    data: {
      status: "DECLINED",
      declinedAt: new Date(),
    },
  });

  // Blind notification: tell sender a slot freed up without revealing who declined
  const requestWithSender = await prisma.matchRequest.findUnique({
    where: { id: requestId },
    include: {
      sender: {
        include: {
          sentRequests: { where: { status: "PENDING" } },
          account: { select: { email: true, firstName: true } },
        },
      },
    },
  });

  if (requestWithSender?.sender?.account?.email) {
    const slotsRemaining =
      MAX_ACTIVE_REQUEST_SLOTS - requestWithSender.sender.sentRequests.length;
    sendEmail({
      to: requestWithSender.sender.account.email,
      subject: "Lifeline — A request slot is now available",
      html: `<p>Hi ${requestWithSender.sender.account.firstName},</p>
<p>One of your match requests has been resolved and you now have <strong>${slotsRemaining} slot${slotsRemaining !== 1 ? "s" : ""}</strong> available.</p>
<p>Head back to the app to explore new connections.</p>
<p>— The Lifeline Team</p>`,
    }).catch((err) =>
      console.error("[requestService] Blind decline email failed:", err?.message),
    );
  }

  return {
    success: true,
    message: "Request declined",
  };
};

export const cancelMatchRequest = async (
  senderAccountId: string,
  requestId: string,
) => {
  const sender = await prisma.user.findUnique({
    where: { accountId: senderAccountId },
    select: { id: true },
  });

  if (!sender) throw new Error("User not found");

  const request = await prisma.matchRequest.findUnique({
    where: { id: requestId },
  });

  if (!request || request.senderId !== sender.id) {
    throw new Error("Match request not found");
  }

  if (request.status !== "PENDING") {
    throw new Error("This request is no longer pending");
  }

  await prisma.matchRequest.update({
    where: { id: requestId },
    data: {
      status: "CANCELLED",
    },
  });

  return {
    success: true,
    message: "Request cancelled and slot reclaimed",
  };
};

// First-Come Acceptance Concurrency Resolution
export const acceptMatchRequest = async (
  receiverAccountId: string,
  requestId: string,
) => {
  const receiver = await prisma.user.findUnique({
    where: { accountId: receiverAccountId },
    include: {
      assignedCounselor: { select: { id: true, accountId: true } },
    },
  });

  if (!receiver) throw new Error("Receiver user profile not found");

  const request = await prisma.matchRequest.findUnique({
    where: { id: requestId },
    include: {
      sender: {
        include: {
          assignedCounselor: { select: { id: true, accountId: true } },
        },
      },
    },
  });

  if (!request || request.receiverId !== receiver.id) {
    throw new Error("Match request not found");
  }

  if (request.status !== "PENDING") {
    throw new Error("This request is no longer available or was superseded");
  }

  const sender = request.sender;

  // Execute First-Come Acceptance Atomic Transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1. Mark request as accepted
    const acceptedRequest = await tx.matchRequest.update({
      where: { id: requestId },
      data: { status: "ACCEPTED" },
    });

    // 2. Create Match record
    const match = await tx.match.create({
      data: {
        status: "IN_CONVERSATION",
        counselorId: receiver.assignedCounselorId || sender.assignedCounselorId || null,
      },
    });

    // 3. Create MatchParticipants
    await tx.matchParticipant.createMany({
      data: [
        { matchId: match.id, userId: sender.id },
        { matchId: match.id, userId: receiver.id },
      ],
    });

    // 4. Auto-cancel / Supersede all other pending requests involving either party
    await tx.matchRequest.updateMany({
      where: {
        id: { not: requestId },
        status: "PENDING",
        OR: [
          { senderId: sender.id },
          { receiverId: sender.id },
          { senderId: receiver.id },
          { receiverId: receiver.id },
        ],
      },
      data: {
        status: "SUPERSEDED",
        supersededAt: new Date(),
      },
    });

    // 5. Exit discovery pool for both users while actively matched
    await tx.user.update({
      where: { id: sender.id },
      data: { isDiscoveryIndexed: false },
    });
    await tx.user.update({
      where: { id: receiver.id },
      data: { isDiscoveryIndexed: false },
    });

    // 6. Provision Both Channels:
    // A. Direct Private Couple Chat
    const coupleConversation = await tx.conversation.create({
      data: {
        matchId: match.id,
        type: "COUPLE_PRIVATE",
        participants: {
          create: [
            { accountId: sender.accountId, roleInChat: "COUPLE_MEMBER" },
            { accountId: receiver.accountId, roleInChat: "COUPLE_MEMBER" },
          ],
        },
      },
    });

    // B. 4-Party Counselor Guided Group Chat
    const groupParticipants = [
      { accountId: sender.accountId, roleInChat: "COUPLE_MEMBER" },
      { accountId: receiver.accountId, roleInChat: "COUPLE_MEMBER" },
    ];
    if (sender.assignedCounselor?.accountId) {
      groupParticipants.push({
        accountId: sender.assignedCounselor.accountId,
        roleInChat: "COUNSELOR",
      });
    }
    if (
      receiver.assignedCounselor?.accountId &&
      receiver.assignedCounselor.accountId !== sender.assignedCounselor?.accountId
    ) {
      groupParticipants.push({
        accountId: receiver.assignedCounselor.accountId,
        roleInChat: "COUNSELOR",
      });
    }

    const counselorConversation = await tx.conversation.create({
      data: {
        matchId: match.id,
        type: "COUNSELOR_GROUP",
        participants: {
          create: groupParticipants,
        },
      },
    });

    return {
      matchId: match.id,
      coupleConversationId: coupleConversation.id,
      counselorConversationId: counselorConversation.id,
    };
  });

  return {
    success: true,
    message: "Match request accepted! Private and Counselor channels have been initialized.",
    data: result,
  };
};
