import { Request, Response } from "express";
import {
  acceptMatchRequest,
  cancelMatchRequest,
  declineMatchRequest,
  getReceivedMatchRequests,
  getSentMatchRequests,
  sendMatchRequest,
} from "../services/requestService";

export const sendRequest = async (req: Request, res: Response) => {
  try {
    const senderAccountId = req.account?.id;
    const { receiverUserId } = req.body;

    if (!senderAccountId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!receiverUserId) {
      return res.status(400).json({ success: false, message: "receiverUserId is required" });
    }

    const result = await sendMatchRequest(senderAccountId, receiverUserId);

    return res.status(201).json({
      success: true,
      message: "Match request sent successfully",
      data: result,
      errors: null,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to send match request",
      errors: error.message,
    });
  }
};

export const getSent = async (req: Request, res: Response) => {
  try {
    const accountId = req.account?.id;
    if (!accountId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await getSentMatchRequests(accountId);

    return res.json({
      success: true,
      message: "Sent match requests retrieved",
      data: result,
      errors: null,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch sent requests",
      errors: error.message,
    });
  }
};

export const getReceived = async (req: Request, res: Response) => {
  try {
    const accountId = req.account?.id;
    if (!accountId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await getReceivedMatchRequests(accountId);

    return res.json({
      success: true,
      message: "Received match requests retrieved",
      data: result,
      errors: null,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch received requests",
      errors: error.message,
    });
  }
};

export const accept = async (req: Request, res: Response) => {
  try {
    const accountId = req.account?.id;
    const id = req.params.id as string;

    if (!accountId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await acceptMatchRequest(accountId, id);

    return res.json({
      success: true,
      message: result.message,
      data: result.data,
      errors: null,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to accept match request",
      errors: error.message,
    });
  }
};

export const decline = async (req: Request, res: Response) => {
  try {
    const accountId = req.account?.id;
    const id = req.params.id as string;

    if (!accountId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await declineMatchRequest(accountId, id);

    return res.json({
      success: true,
      message: result.message,
      data: null,
      errors: null,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to decline match request",
      errors: error.message,
    });
  }
};

export const cancel = async (req: Request, res: Response) => {
  try {
    const accountId = req.account?.id;
    const id = req.params.id as string;

    if (!accountId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await cancelMatchRequest(accountId, id);

    return res.json({
      success: true,
      message: result.message,
      data: null,
      errors: null,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to cancel match request",
      errors: error.message,
    });
  }
};
