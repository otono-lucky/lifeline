import { prisma } from "../config/db";

export const listUserConversations = async (accountId: string) => {
  // Step 1: Get all conversations the user is a participant in
  const rows = await prisma.conversationParticipant.findMany({
    where: { accountId },
    include: {
      conversation: {
        include: {
          // Get raw participant rows (accountId + roleInChat only — no Account relation on model)
          participants: true,
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
            include: {
              sender: {
                select: { id: true, firstName: true, lastName: true },
              },
            },
          },
        },
      },
    },
    orderBy: { conversation: { updatedAt: "desc" } },
  });

  // Step 2: Collect all unique participant accountIds across all conversations
  const allParticipantAccountIds = [
    ...new Set(
      rows.flatMap((r) => r.conversation.participants.map((cp) => cp.accountId)),
    ),
  ];

  // Step 3: Batch-load Account + User + photos for all participants in one query
  const accounts = await prisma.account.findMany({
    where: { id: { in: allParticipantAccountIds } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      user: {
        select: {
          profilePictureUrl: true,
          photos: {
            take: 1,
            orderBy: { order: "asc" },
            select: { url: true },
          },
        },
      },
    },
  });

  // Step 4: Build a quick lookup map
  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  // Step 5: Map conversations to the enriched response shape
  return rows.map((p) => {
    const conv = p.conversation;
    const lastMsg = conv.messages[0];

    const participants = conv.participants.map((cp) => {
      const acct = accountMap.get(cp.accountId);
      return {
        accountId: cp.accountId,
        roleInChat: cp.roleInChat,
        firstName: acct?.firstName ?? "",
        lastName: acct?.lastName ?? "",
        photoUrl:
          acct?.user?.profilePictureUrl ||
          (acct?.user?.photos[0]?.url ?? null),
        isMe: cp.accountId === accountId,
      };
    });

    return {
      id: conv.id,
      conversationId: conv.id,
      matchId: conv.matchId,
      type: conv.type,
      roleInChat: p.roleInChat,
      updatedAt: conv.updatedAt,
      createdAt: conv.createdAt,
      participants,
      lastMessage: lastMsg
        ? {
            id: lastMsg.id,
            senderId: lastMsg.senderId,
            content: lastMsg.content,
            mediaUrl: lastMsg.mediaUrl,
            senderName: `${lastMsg.sender.firstName} ${lastMsg.sender.lastName}`,
            isMe: lastMsg.senderId === accountId,
            createdAt: lastMsg.createdAt,
          }
        : null,
    };
  });
};

export const getConversationMessages = async (
  accountId: string,
  conversationId: string,
  options?: { page?: number; limit?: number },
) => {
  const page = options?.page || 1;
  const limit = options?.limit || 50;
  const skip = (page - 1) * limit;

  // Verify participant
  const isParticipant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_accountId: {
        conversationId,
        accountId,
      },
    },
  });

  if (!isParticipant) {
    throw new Error("You are not a participant in this conversation");
  }

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId },
      skip,
      take: limit,
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    }),
    prisma.message.count({ where: { conversationId } }),
  ]);

  return {
    messages: messages.map((m) => ({
      id: m.id,
      // senderId exposed at top-level: Message.senderId → Account.id
      // Mobile uses `msg.senderId === user.accountId` for bubble side
      senderId: m.senderId,
      content: m.content,
      mediaUrl: m.mediaUrl,
      createdAt: m.createdAt,
      readAt: m.readAt,
      sender: {
        id: m.sender.id,
        firstName: m.sender.firstName,
        lastName: m.sender.lastName,
        name: `${m.sender.firstName} ${m.sender.lastName}`,
        role: m.sender.role,
        isMe: m.sender.id === accountId,
      },
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const sendMessage = async (
  senderAccountId: string,
  conversationId: string,
  content: string,
  mediaUrl?: string,
) => {
  const isParticipant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_accountId: {
        conversationId,
        accountId: senderAccountId,
      },
    },
  });

  if (!isParticipant) {
    throw new Error("You are not authorized to post in this conversation");
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: senderAccountId,
      content,
      mediaUrl,
    },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
  });

  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    content: message.content,
    mediaUrl: message.mediaUrl,
    createdAt: message.createdAt,
    sender: {
      id: message.sender.id,
      firstName: message.sender.firstName,
      lastName: message.sender.lastName,
      name: `${message.sender.firstName} ${message.sender.lastName}`,
      role: message.sender.role,
      // sendMessage caller is always the sender, so isMe is always true
      isMe: true,
    },
  };
};

// Dynamic Calendar & Auto-Add Logic
export const proposeCalendarEvent = async (
  proposerAccountId: string,
  matchId: string,
  data: {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    meetingLink?: string;
  },
) => {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      participants: {
        include: { user: true },
      },
    },
  });

  if (!match) throw new Error("Match not found");

  const event = await prisma.calendarEvent.create({
    data: {
      matchId,
      proposedById: proposerAccountId,
      title: data.title,
      description: data.description,
      startTime: data.startTime,
      endTime: data.endTime,
      meetingLink: data.meetingLink,
      status: "PROPOSED",
    },
  });

  return event;
};

export const respondToCalendarEvent = async (
  responderAccountId: string,
  eventId: string,
  status: "CONFIRMED" | "CANCELLED",
) => {
  const event = await prisma.calendarEvent.findUnique({
    where: { id: eventId },
  });

  if (!event) throw new Error("Calendar event not found");

  const updatedEvent = await prisma.calendarEvent.update({
    where: { id: eventId },
    data: { status },
  });

  return {
    success: true,
    message:
      status === "CONFIRMED"
        ? "Meeting confirmed and auto-added to participant calendars"
        : "Meeting cancelled",
    event: updatedEvent,
  };
};

/**
 * Get all calendar events for the current user's active matches.
 * Resolves: Account → User → MatchParticipants → Match → CalendarEvents
 */
export const getUserCalendarEvents = async (accountId: string) => {
  // Step 1: find the User row for this account
  const userRow = await prisma.user.findUnique({
    where: { accountId },
    select: { id: true },
  });

  if (!userRow) throw new Error("User profile not found");

  // Step 2: fetch all matches the user participates in
  const participations = await prisma.matchParticipant.findMany({
    where: { userId: userRow.id },
    select: { matchId: true },
  });

  const matchIds = participations.map((p) => p.matchId);

  if (matchIds.length === 0) return [];

  // Step 3: fetch all calendar events for those matches
  const events = await prisma.calendarEvent.findMany({
    where: { matchId: { in: matchIds } },
    include: {
      proposedBy: {
        select: { id: true, firstName: true, lastName: true },
      },
      match: {
        include: {
          participants: {
            include: {
              user: {
                include: {
                  account: { select: { firstName: true, lastName: true } },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { startTime: "asc" },
  });

  return events.map((e) => {
    // Derive the partner's name (the other participant who isn't me)
    const otherParticipant = e.match.participants.find(
      (p) => p.user.accountId !== accountId,
    );
    const partnerName = otherParticipant
      ? `${otherParticipant.user.account.firstName} ${otherParticipant.user.account.lastName}`
      : "Your Match";

    return {
      id: e.id,
      matchId: e.matchId,
      title: e.title,
      description: e.description,
      startTime: e.startTime,
      endTime: e.endTime,
      meetingLink: e.meetingLink,
      status: e.status,
      createdAt: e.createdAt,
      proposedBy: {
        accountId: e.proposedById,
        name: `${e.proposedBy.firstName} ${e.proposedBy.lastName}`,
        isMe: e.proposedById === accountId,
      },
      partnerName,
    };
  });
};
