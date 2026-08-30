import { prisma } from "../config/db";

export const listUserConversations = async (accountId: string) => {
  const conversations = await prisma.conversationParticipant.findMany({
    where: { accountId },
    include: {
      conversation: {
        include: {
          participants: {
            include: {
              conversation: false,
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
            include: {
              sender: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
      },
    },
  });

  return conversations.map((p) => {
    const conv = p.conversation;
    const lastMsg = conv.messages[0];
    return {
      conversationId: conv.id,
      matchId: conv.matchId,
      type: conv.type,
      roleInChat: p.roleInChat,
      createdAt: conv.createdAt,
      lastMessage: lastMsg
        ? {
            id: lastMsg.id,
            content: lastMsg.content,
            mediaUrl: lastMsg.mediaUrl,
            senderName: `${lastMsg.sender.firstName} ${lastMsg.sender.lastName}`,
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
      content: m.content,
      mediaUrl: m.mediaUrl,
      createdAt: m.createdAt,
      readAt: m.readAt,
      sender: {
        id: m.sender.id,
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
    content: message.content,
    mediaUrl: message.mediaUrl,
    createdAt: message.createdAt,
    sender: {
      id: message.sender.id,
      name: `${message.sender.firstName} ${message.sender.lastName}`,
      role: message.sender.role,
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
