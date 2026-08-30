import { Request, Response } from "express";
import {
  getConversationMessages,
  listUserConversations,
  proposeCalendarEvent,
  respondToCalendarEvent,
  sendMessage,
} from "../services/communicationService";

export const getConversations = async (req: Request, res: Response) => {
  try {
    const accountId = req.account?.id;
    if (!accountId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await listUserConversations(accountId);

    return res.json({
      success: true,
      message: "Conversations retrieved",
      data: result,
      errors: null,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch conversations",
      errors: error.message,
    });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const accountId = req.account?.id;
    const conversationId = req.params.conversationId as string;
    const { page, limit } = req.query;

    if (!accountId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await getConversationMessages(accountId, conversationId, {
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 50,
    });

    return res.json({
      success: true,
      message: "Messages retrieved",
      data: result.messages,
      pagination: result.pagination,
      errors: null,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch messages",
      errors: error.message,
    });
  }
};

export const postMessage = async (req: Request, res: Response) => {
  try {
    const accountId = req.account?.id;
    const conversationId = req.params.conversationId as string;
    const { content, mediaUrl } = req.body;

    if (!accountId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!content && !mediaUrl) {
      return res.status(400).json({ success: false, message: "Message content or media is required" });
    }

    const result = await sendMessage(accountId, conversationId, content || "", mediaUrl);

    return res.status(201).json({
      success: true,
      message: "Message sent",
      data: result,
      errors: null,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to send message",
      errors: error.message,
    });
  }
};

export const proposeEvent = async (req: Request, res: Response) => {
  try {
    const accountId = req.account?.id;
    const matchId = req.params.matchId as string;
    const { title, description, startTime, endTime, meetingLink } = req.body;

    if (!accountId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!title || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Title, startTime, and endTime are required",
      });
    }

    const event = await proposeCalendarEvent(accountId, matchId, {
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      meetingLink,
    });

    return res.status(201).json({
      success: true,
      message: "Calendar event proposed",
      data: event,
      errors: null,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to propose calendar event",
      errors: error.message,
    });
  }
};

export const respondEvent = async (req: Request, res: Response) => {
  try {
    const accountId = req.account?.id;
    const eventId = req.params.eventId as string;
    const { status } = req.body;

    if (!accountId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!["CONFIRMED", "CANCELLED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be CONFIRMED or CANCELLED",
      });
    }

    const result = await respondToCalendarEvent(accountId, eventId, status);

    return res.json({
      success: true,
      message: result.message,
      data: result.event,
      errors: null,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to respond to calendar event",
      errors: error.message,
    });
  }
};
