import { Request, Response } from "express";
import { MatchDecision } from "@prisma/client";
import {
  createManualMatch,
  decideMatch,
  getActiveMatchForUser,
  getMatchById,
  getMatchHistoryForUser,
  getMatchPublicProfile,
  getMatchPublicProfileForMatch,
  listMatches,
} from "../services/matchingService";
import { errorResponse, successResponse } from "../utils/responseHandler";

export const create = async (req: Request, res: Response) => {
  try {
    const { accountIdA, accountIdB } = req.body;
    if (!accountIdA || !accountIdB) {
      return res
        .status(400)
        .json(errorResponse("accountIdA and accountIdB are required"));
    }

    const match = await createManualMatch(
      req.account.id,
      String(accountIdA),
      String(accountIdB),
    );
    res.status(201).json(successResponse("Match created successfully", { match }));
  } catch (error: any) {
    res
      .status(400)
      .json(errorResponse(error.message || "Server error creating match"));
  }
};

export const getActive = async (req: Request, res: Response) => {
  try {
    const match = await getActiveMatchForUser(req.account.id);
    res.json(successResponse("Active match fetched", { match }));
  } catch (error: any) {
    res
      .status(400)
      .json(errorResponse(error.message || "Server error fetching active match"));
  }
};

export const getActiveForAccount = async (req: Request, res: Response) => {
  try {
    const match = await getActiveMatchForUser(String(req.params.accountId));
    res.json(successResponse("Active match fetched", { match }));
  } catch (error: any) {
    res
      .status(400)
      .json(errorResponse(error.message || "Server error fetching active match"));
  }
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    const matches = await getMatchHistoryForUser(req.account.id);
    res.json(successResponse("Match history fetched", { matches }));
  } catch (error: any) {
    res
      .status(400)
      .json(errorResponse(error.message || "Server error fetching match history"));
  }
};

export const getHistoryForAccount = async (req: Request, res: Response) => {
  try {
    const matches = await getMatchHistoryForUser(String(req.params.accountId));
    res.json(successResponse("Match history fetched", { matches }));
  } catch (error: any) {
    res
      .status(400)
      .json(errorResponse(error.message || "Server error fetching match history"));
  }
};

export const decide = async (req: Request, res: Response) => {
  try {
    const matchId = String(req.params.matchId);
    const decision = String(req.body?.decision) as MatchDecision;
    const feedback = req.body?.feedback ? String(req.body.feedback) : undefined;

    if (!["ACCEPTED", "DECLINED"].includes(decision)) {
      return res
        .status(400)
        .json(errorResponse("decision must be ACCEPTED or DECLINED"));
    }

    const match = await decideMatch(req.account.id, matchId, decision, feedback);
    res.json(successResponse("Decision saved successfully", { match }));
  } catch (error: any) {
    res
      .status(400)
      .json(errorResponse(error.message || "Server error saving decision"));
  }
};

export const getPublicProfile = async (req: Request, res: Response) => {
  try {
    const targetAccountId = String(req.params.accountId);
    const profile = await getMatchPublicProfile(req.account.id, targetAccountId);
    res.json(successResponse("Public profile fetched", { profile }));
  } catch (error: any) {
    res
      .status(400)
      .json(errorResponse(error.message || "Server error fetching public profile"));
  }
};

export const getMatchProfile = async (req: Request, res: Response) => {
  try {
    const matchId = String(req.params.matchId);
    const targetAccountId = String(req.params.accountId);
    const profile = await getMatchPublicProfileForMatch(
      req.account.id,
      req.account.role,
      matchId,
      targetAccountId,
    );
    res.json(successResponse("Public profile fetched", { profile }));
  } catch (error: any) {
    res
      .status(400)
      .json(errorResponse(error.message || "Server error fetching public profile"));
  }
};

export const getMatchDetails = async (req: Request, res: Response) => {
  try {
    const matchId = String(req.params.matchId);
    const match = await getMatchById(req.account.id, req.account.role, matchId);
    res.json(successResponse("Match fetched", { match }));
  } catch (error: any) {
    res
      .status(400)
      .json(errorResponse(error.message || "Server error fetching match"));
  }
};

export const listAll = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res
      .status(400)
      .json(errorResponse(error.message || "Server error fetching matches"));
  }
};
