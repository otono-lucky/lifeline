import { Request, Response } from "express";
import {
  reviewAppealRequest,
  reviewUserVetting,
  submitAppealRequest,
} from "../services/vettingService";
import { resetUserAfterDebrief } from "../services/debriefService";

export const reviewVetting = async (req: Request, res: Response) => {
  try {
    const counselorAccountId = req.account?.id;
    const userId = req.params.userId as string;
    const { decision, reason, notes } = req.body;

    if (!counselorAccountId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!decision || !["APPROVE", "REJECT", "HARD_BLOCK"].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Valid decision required: APPROVE, REJECT, or HARD_BLOCK",
      });
    }

    const result = await reviewUserVetting(
      counselorAccountId,
      userId,
      decision,
      reason,
      notes,
    );

    return res.json({
      success: true,
      message: `User vetting ${decision.toLowerCase()}d successfully`,
      data: result,
      errors: null,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to process vetting review",
      errors: error.message,
    });
  }
};

export const appealBlock = async (req: Request, res: Response) => {
  try {
    const userAccountId = req.account?.id;
    const { appealReason } = req.body;

    if (!userAccountId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!appealReason) {
      return res.status(400).json({
        success: false,
        message: "appealReason is required",
      });
    }

    const appeal = await submitAppealRequest(userAccountId, appealReason);

    return res.status(201).json({
      success: true,
      message: "Appeal submitted successfully. System administrators will review your account.",
      data: appeal,
      errors: null,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to submit appeal",
      errors: error.message,
    });
  }
};

export const reviewAppeal = async (req: Request, res: Response) => {
  try {
    const superAdminAccountId = req.account?.id;
    const appealId = req.params.appealId as string;
    const { status } = req.body;

    if (!superAdminAccountId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be APPROVED or REJECTED",
      });
    }

    const result = await reviewAppealRequest(superAdminAccountId, appealId, status);

    return res.json({
      success: true,
      message: `Appeal has been ${status.toLowerCase()}`,
      data: result,
      errors: null,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to review appeal",
      errors: error.message,
    });
  }
};

export const debriefReset = async (req: Request, res: Response) => {
  try {
    const counselorAccountId = req.account?.id;
    const userId = req.params.userId as string;
    const { notes, readinessScore, matchId } = req.body;

    if (!counselorAccountId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!notes) {
      return res.status(400).json({ success: false, message: "Debrief notes are required" });
    }

    const result = await resetUserAfterDebrief(counselorAccountId, userId, {
      matchId,
      notes,
      readinessScore,
    });

    return res.json({
      success: true,
      message: result.message,
      data: result,
      errors: null,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to complete debrief reset",
      errors: error.message,
    });
  }
};
