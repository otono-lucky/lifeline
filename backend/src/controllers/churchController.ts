// controllers/church.controller.ts
// Church resource endpoints

import { Request, Response } from "express";
import {
  createChurch,
  getChurches,
  getChurchById,
  updateChurch,
  getChurchMembers,
  updateChurchStatus,
} from "../services/churchService";
import { prisma } from "../config/db";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { Params } from "../types/express";

/**
 * @desc    Create a new church
 * @route   POST /api/churches
 * @access  SuperAdmin
 */
export const create = async (req: Request, res: Response) => {
  console.log("[POST /api/churches] Starting - Email:", req.body?.email);
  try {
    const { officialName, aka, email, phone, state, lga, city, address } =
      req.body;

    // Validation
    if (!officialName || !email || !phone || !state) {
      return res
        .status(400)
        .json(
          errorResponse(
            "Missing required fields: officialName, email, phone, state",
          ),
        );
    }

    // Get SuperAdmin
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { accountId: req.account.id },
    });

    if (!superAdmin) {
      return res
        .status(403)
        .json(errorResponse("SuperAdmin profile not found"));
    }

    const church = await createChurch({
      officialName,
      aka,
      email,
      phone,
      state,
      lga,
      city,
      address,
      createdBy: superAdmin.id,
    });
    console.log("[POST /api/churches] Success - ChurchId:", church.id);

    res
      .status(201)
      .json(successResponse("Church created successfully", { church }));
  } catch (error: any) {
    console.error("[POST /api/churches] Failed:", error.message);
    res
      .status(500)
      .json(errorResponse(error.message || "Server error creating church"));
  }
};

/**
 * @desc    Get all churches
 * @route   GET /api/churches
 * @access  SuperAdmin
 */
export const list = async (req: Request, res: Response) => {
  console.log("[GET /api/churches] Starting");
  try {
    const { status, page, limit } = req.query;

    const result = await getChurches({
      status: status as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    console.log("[GET /api/churches] Success - Count:", result.churches.length);

    res.json(
      successResponse(
        "Churches fetched successfully",
        { churches: result.churches },
        result.pagination,
      ),
    );
  } catch (error: any) {
    console.error("[GET /api/churches] Failed:", error.message);
    res
      .status(500)
      .json(errorResponse(error.message || "Server error fetching churches"));
  }
};

/**
 * @desc    Public list of active churches (minimal fields)
 * @route   GET /api/churches/public
 * @access  Public
 */
export const publicList = async (req: Request, res: Response) => {
  console.log('[GET /api/churches/public] Starting');
  try {
    const { limit } = req.query;

    // Lazy-import service to avoid circular deps
    const { getPublicChurches } = await import('../services/churchService');

    const churches = await getPublicChurches({
      limit: limit ? parseInt(limit as string) : undefined,
    });

    console.log('[GET /api/churches/public] Success - Count:', churches.length);

    res.json(successResponse('Churches fetched successfully', { churches }));
  } catch (error: any) {
    console.error('[GET /api/churches/public] Failed:', error.message);
    res.status(500).json(errorResponse(error.message || 'Server error fetching churches'));
  }
};

/**
 * @desc    Get single church
 * @route   GET /api/churches/:id
 * @access  SuperAdmin, ChurchAdmin (own church)
 */
export const getOne = async (req: Request, res: Response) => {
  console.log("[GET /api/churches/:id] Starting - Id:", req.params?.id);
  try {
    const id = String(req.params.id);

    const church = await getChurchById(id);
    console.log("[GET /api/churches/:id] Success - Id:", church.id);

    res.json(successResponse("Church fetched successfully", { church }));
  } catch (error: any) {
    console.error("[GET /api/churches/:id] Failed:", error.message);

    if (error.message === "Church not found") {
      return res.status(404).json(errorResponse(error.message));
    }

    res
      .status(500)
      .json(errorResponse(error.message || "Server error fetching church"));
  }
};

export const getMembers = async (req: Request<Params>, res: Response) => {
  console.log(
    "[GET /api/churches/:id/members] Starting - ChurchId:",
    req.params?.id,
  );
  try {
    const { verificationStatus, page, limit } = req.query;
    const { id } = req.params;

    const result = await getChurchMembers(req.account.id, {
      churchId: id,
      verificationStatus: verificationStatus as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    console.log(
      "[GET /api/churches/:id/members] Success - Count:",
      result.members.length,
    );

    res.json(
      successResponse(
        "Members fetched successfully",
        { members: result.members },
        result.pagination,
      ),
    );
  } catch (error: any) {
    console.error("[GET /api/churches/:id/members] Failed:", error.message);
    res
      .status(500)
      .json(errorResponse(error.message || "Server error fetching members"));
  }
};

/**
 * @desc    Update church details
 * @route   PUT /api/churches/:id
 * @access  SuperAdmin
 */
export const updateStatus = async (req: Request<Params, {}, { status: string }>, res: Response) => {
  console.log("[PUT /api/churches/:id/status] Starting - Id:", req.params?.id);
  try {
    const id = req.params?.id;
    const { status } = req.body;

    if (!["active", "suspended"].includes(status)) {
      console.error("[PUT /api/churches/:id/status] Failed: Invalid status");
      return res
        .status(400)
        .json(errorResponse("Invalid status. Must be: active or suspended"));
    }

    const church = await updateChurchStatus(id, status);
    console.log("[PUT /api/churches/:id/status] Success - Status:", church.status);

    res.json(successResponse("Church activated successfully", { church }));
  } catch (error: any) {
    console.error("[PUT /api/churches/:id/status] Failed:", error.message);
    res
      .status(500)
      .json(errorResponse(error.message || "Server error updating church"));
  }
};

export const update = async (req: Request, res: Response) => {
  console.log("[PUT /api/churches/:id] Starting - Id:", req.params?.id);
  try {
    const id = String(req.params?.id);
    const { officialName, aka, phone, state, lga, city, address } = req.body;

    const church = await updateChurch(id, {
      officialName,
      aka,
      phone,
      state,
      lga,
      city,
      address,
    });
    console.log("[PUT /api/churches/:id] Success - Id:", church.id);

    res.json(successResponse("Church updated successfully", { church }));
  } catch (error: any) {
    console.error("[PUT /api/churches/:id] Failed:", error.message);
    res
      .status(500)
      .json(errorResponse(error.message || "Server error updating church"));
  }
};
