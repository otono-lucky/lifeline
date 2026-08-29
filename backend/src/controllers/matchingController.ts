import { Request, Response } from "express";
import {
  createManualMatch,
  getActiveMatchForUser,
  getMatchById,
  getMatchHistoryForUser,
  getMatchPublicProfile,
  getMatchPublicProfileForMatch,
  listMatches,
} from "../services/matchingService";
import { endRelationshipMatch } from "../services/debriefService";
import { errorResponse, successResponse } from "../utils/responseHandler";

export const create = async (req: Request, res: Response) => {
  console.log("[POST /api/matches] Starting - CreatedBy:", req.account?.id);
  try {
    const { accountIdA, accountIdB } = req.body;
    if (!accountIdA || !accountIdB) {
      console.error("[POST /api/matches] Failed: accountIdA/accountIdB required");
      return res
        .status(400)
        .json(errorResponse("accountIdA and accountIdB are required"));
    }

    const match = await createManualMatch(
      req.account.id,
      String(accountIdA),
      String(accountIdB),
    );
    console.log("[POST /api/matches] Success - Match:", match.id);
    res.status(201).json(successResponse("Match created successfully", { match }));
  } catch (error: any) {
    console.error("[POST /api/matches] Failed:", error.message);
    res
      .status(400)
      .json(errorResponse(error.message || "Server error creating match"));
  }
};

export const getActive = async (req: Request, res: Response) => {
  console.log("[GET /api/matches/active] Starting - Account:", req.account?.id);
  try {
    const match = await getActiveMatchForUser(req.account.id);
    console.log("[GET /api/matches/active] Success");
    res.json(successResponse("Active match fetched", { match }));
  } catch (error: any) {
    console.error("[GET /api/matches/active] Failed:", error.message);
    res
      .status(400)
      .json(errorResponse(error.message || "Server error fetching active match"));
  }
};

export const getActiveForAccount = async (req: Request, res: Response) => {
  console.log(
    "[GET /api/matches/active/:accountId] Starting - Target:",
    req.params.accountId,
  );
  try {
    const match = await getActiveMatchForUser(String(req.params.accountId));
    console.log("[GET /api/matches/active/:accountId] Success");
    res.json(successResponse("Active match fetched", { match }));
  } catch (error: any) {
    console.error("[GET /api/matches/active/:accountId] Failed:", error.message);
    res
      .status(400)
      .json(errorResponse(error.message || "Server error fetching active match"));
  }
};

export const getHistory = async (req: Request, res: Response) => {
  console.log("[GET /api/matches/history] Starting - Account:", req.account?.id);
  try {
    const matches = await getMatchHistoryForUser(req.account.id);
    console.log("[GET /api/matches/history] Success");
    res.json(successResponse("Match history fetched", { matches }));
  } catch (error: any) {
    console.error("[GET /api/matches/history] Failed:", error.message);
    res
      .status(400)
      .json(errorResponse(error.message || "Server error fetching match history"));
  }
};

export const getHistoryForAccount = async (req: Request, res: Response) => {
  console.log(
    "[GET /api/matches/history/:accountId] Starting - Target:",
    req.params.accountId,
  );
  try {
    const matches = await getMatchHistoryForUser(String(req.params.accountId));
    console.log("[GET /api/matches/history/:accountId] Success");
    res.json(successResponse("Match history fetched", { matches }));
  } catch (error: any) {
    console.error("[GET /api/matches/history/:accountId] Failed:", error.message);
    res
      .status(400)
      .json(errorResponse(error.message || "Server error fetching match history"));
  }
};

export const endMatch = async (req: Request, res: Response) => {
  console.log(
    "[POST /api/matches/:matchId/end] Starting - Match:",
    req.params.matchId,
    "Account:",
    req.account?.id,
  );
  try {
    const matchId = String(req.params.matchId);
    const { reason } = req.body;

    const result = await endRelationshipMatch(req.account.id, matchId, reason);
    console.log("[POST /api/matches/:matchId/end] Success");
    res.json(successResponse(result.message, null));
  } catch (error: any) {
    console.error("[POST /api/matches/:matchId/end] Failed:", error.message);
    res
      .status(400)
      .json(errorResponse(error.message || "Server error ending match"));
  }
};

export const getPublicProfile = async (req: Request, res: Response) => {
  console.log(
    "[GET /api/matches/public-profile/:accountId] Starting - Target:",
    req.params.accountId,
  );
  try {
    const targetAccountId = String(req.params.accountId);
    const profile = await getMatchPublicProfile(req.account.id, targetAccountId);
    console.log("[GET /api/matches/public-profile/:accountId] Success");
    res.json(successResponse("Public profile fetched", { profile }));
  } catch (error: any) {
    console.error(
      "[GET /api/matches/public-profile/:accountId] Failed:",
      error.message,
    );
    res
      .status(400)
      .json(errorResponse(error.message || "Server error fetching public profile"));
  }
};

export const getMatchProfile = async (req: Request, res: Response) => {
  console.log(
    "[GET /api/matches/:matchId/profile/:accountId] Starting - Match:",
    req.params.matchId,
    "Target:",
    req.params.accountId,
  );
  try {
    const matchId = String(req.params.matchId);
    const targetAccountId = String(req.params.accountId);
    const profile = await getMatchPublicProfileForMatch(
      req.account.id,
      req.account.role,
      matchId,
      targetAccountId,
    );
    console.log("[GET /api/matches/:matchId/profile/:accountId] Success");
    res.json(successResponse("Public profile fetched", { profile }));
  } catch (error: any) {
    console.error(
      "[GET /api/matches/:matchId/profile/:accountId] Failed:",
      error.message,
    );
    res
      .status(400)
      .json(errorResponse(error.message || "Server error fetching public profile"));
  }
};

export const getMatchDetails = async (req: Request, res: Response) => {
  console.log(
    "[GET /api/matches/:matchId] Starting - Match:",
    req.params.matchId,
  );
  try {
    const matchId = String(req.params.matchId);
    const match = await getMatchById(req.account.id, req.account.role, matchId);
    console.log("[GET /api/matches/:matchId] Success");
    res.json(successResponse("Match fetched", { match }));
  } catch (error: any) {
    console.error("[GET /api/matches/:matchId] Failed:", error.message);
    res
      .status(400)
      .json(errorResponse(error.message || "Server error fetching match"));
  }
};

export const listAll = async (req: Request, res: Response) => {
  console.log("[GET /api/matches] Starting - Account:", req.account?.id);
  try {
    const { status, createdBy, counselorId, churchId, dateFrom, dateTo, page, limit } =
      req.query;

    const result = await listMatches({
      status: status as any,
      createdBy: createdBy ? String(createdBy) : undefined,
      counselorId: counselorId ? String(counselorId) : undefined,
      churchId: churchId ? String(churchId) : undefined,
      dateFrom: dateFrom ? new Date(String(dateFrom)) : undefined,
      dateTo: dateTo ? new Date(String(dateTo)) : undefined,
      page: page ? parseInt(String(page)) : undefined,
      limit: limit ? parseInt(String(limit)) : undefined,
    });

    res.json(
      successResponse("Matches fetched", { matches: result.matches }, result.pagination),
    );
    console.log("[GET /api/matches] Success");
  } catch (error: any) {
    console.error("[GET /api/matches] Failed:", error.message);
    res
      .status(400)
      .json(errorResponse(error.message || "Server error fetching matches"));
  }
};
