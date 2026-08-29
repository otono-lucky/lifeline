// controllers/counsellorController.ts
// Counselor endpoints with unified responses

import { Request, Response } from "express";
import {
  getCounselorDashboard,
  getAssignedUsers,
  getCounselorById,
  updateCounselor,
  getCounselorsByChurch,
  getCounselors,
} from "../services/counsellorService";
import { createCounselor } from "../services/accountService";
import { generateToken } from "../utils/tokenManager";
import { successResponse, errorResponse } from "../utils/responseHandler";
import { Params } from "../types/express";
import { prisma } from "../config/db";
import { STATUS_TYPES } from "../constants";
import { StatusType, UserVettingStatus } from "@prisma/client";

/**
 * @desc    Get Counselor dashboard
 * @route   GET /api/counselor/dashboard
 * @access  Counselor, ChurchAdmin
 */
export const getDashboard = async (req: Request, res: Response) => {
  try {
    const dashboard = await getCounselorDashboard(
      req.account.id,
      req.params?.id as string | undefined,
    );
    res.json(successResponse("Dashboard data fetched successfully", dashboard));
  } catch (error: any) {
    res
      .status(500)
      .json(errorResponse(error.message || "Server error fetching dashboard"));
  }
};

/**
 * @desc    Get assigned users
 * @route   GET /api/counselor/assigned-users
 * @access  Counselor
 */
export const getMyAssignedUsers = async (
  req: Request<{ id?: string }>,
  res: Response,
) => {
  try {
    const { verificationStatus, vettingStatus, page, limit } = req.query;
    const { id } = req.params;

    const result = await getAssignedUsers(req.account.id, id, {
      vettingStatus: (vettingStatus || verificationStatus) as UserVettingStatus,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });

    res.json(
      successResponse(
        "Assigned users fetched successfully",
        { users: result.users },
        result.pagination,
      ),
    );
  } catch (error: any) {
    res
      .status(500)
      .json(
        errorResponse(error.message || "Server error fetching assigned users"),
      );
  }
};



/**
 * @desc    Get single counselor by ID
 * @route   GET /api/counselor/:id
 * @access  Counselor (own profile), ChurchAdmin, SuperAdmin
 */
export const getCounselorDetails = async (
  req: Request<Params>,
  res: Response,
) => {
  try {
    const { id } = req.params;

    if (req.account.role === "Counselor" && req.account.id !== id) {
      return res
        .status(403)
        .json(errorResponse("You can only view your own profile"));
    }

    const counselor = await getCounselorById(id);
    res.json(
      successResponse("Counselor fetched successfully", { counselor }),
    );
  } catch (error: any) {
    if (error.message === "Counselor not found") {
      return res.status(404).json(errorResponse(error.message));
    }
    res
      .status(500)
      .json(errorResponse(error.message || "Server error fetching counselor"));
  }
};

/**
 * @desc    Update counselor details
 * @route   PUT /api/counselor/:id
 * @access  Counselor (own profile), ChurchAdmin, SuperAdmin
 */
export const updateCounselorDetails = async (
  req: Request<Params>,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { bio } = req.body;

    if (req.account.role === "Counselor" && req.account.id !== id) {
      return res
        .status(403)
        .json(errorResponse("You can only update your own profile"));
    }

    const counselor = await updateCounselor(id, { bio });
    res.json(
      successResponse("Counselor updated successfully", { counselor }),
    );
  } catch (error: any) {
    res
      .status(500)
      .json(errorResponse(error.message || "Server error updating counselor"));
  }
};

/**
 * @desc    Create counselor account
 * @route   POST /api/counselor/create
 * @access  ChurchAdmin, SuperAdmin
 */
export const createCounselorAccount = async (req: Request, res: Response) => {
  try {
    const {
      churchId,
      email,
      password,
      firstName,
      lastName,
      phone,
      bio,
    } = req.body;

    let targetChurchId = churchId;

    if (req.account.role === "ChurchAdmin") {
      const churchAdmin = await prisma.churchAdmin.findUnique({
        where: { accountId: req.account.id },
        select: { churchId: true },
      });

      if (!churchAdmin) {
        return res
          .status(403)
          .json(errorResponse("Church admin profile not found"));
      }

      targetChurchId = churchAdmin.churchId;
    }

    if (!targetChurchId || !email || !password || !firstName || !lastName) {
      return res.status(400).json(
        errorResponse("Missing required fields", {
          required: ["churchId", "email", "password", "firstName", "lastName"],
        }),
      );
    }

    const result = await createCounselor({
      churchId: targetChurchId,
      email,
      password,
      firstName,
      lastName,
      phone,
      bio,
      role: "Counselor",
    });

    const token = generateToken({
      id: result.account.id,
      email: result.account.email,
      role: result.account.role,
      firstName: result.account.firstName,
    });

    res.status(201).json(
      successResponse("Counselor account created successfully", {
        account: {
          id: result.account.id,
          email: result.account.email,
          firstName: result.account.firstName,
          lastName: result.account.lastName,
          role: result.account.role,
        },
        counselor: {
          accountId: result.account.id,
          churchId: result.counselor.churchId,
        },
        token,
      }),
    );
  } catch (error: any) {
    res
      .status(500)
      .json(errorResponse(error.message || "Server error creating counselor"));
  }
};

/**
 * @desc    Get all counselors (SuperAdmin only)
 * @route   GET /api/counselor/list-all
 * @access  SuperAdmin
 */
export const getAllCounselors = async (req: Request, res: Response) => {
  try {
    const { status, page, limit } = req.query;

    if (status && !STATUS_TYPES.includes(status as any)) {
      return res
        .status(400)
        .json(
          errorResponse(
            "Invalid status. Must be 'pending', 'active', 'suspended', 'deleted'",
          ),
        );
    }

    const superAdmin = await prisma.superAdmin.findUnique({
      where: { accountId: req.account.id },
    });

    if (!superAdmin) {
      return res
        .status(403)
        .json(errorResponse("Super admin profile required"));
    }

    const counselors = await getCounselors({
      status: status as StatusType,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });

    res.json(
      successResponse("Counselors fetched successfully", { counselors }),
    );
  } catch (error: any) {
    res
      .status(500)
      .json(errorResponse(error.message || "Server error fetching counselors"));
  }
};

/**
 * @desc    Get counselors for a church
 * @route   GET /api/counselor/list
 * @access  ChurchAdmin, SuperAdmin
 */
export const list = async (req: Request, res: Response) => {
  try {
    let churchId = req.query.churchId as string | undefined;

    if (req.account.role === "ChurchAdmin") {
      const churchAdmin = await prisma.churchAdmin.findUnique({
        where: { accountId: req.account.id },
        select: { churchId: true },
      });

      if (!churchAdmin) {
        return res
          .status(403)
          .json(errorResponse("Church admin profile not found"));
      }

      churchId = churchAdmin.churchId;
    }

    if (!churchId) {
      return res.status(400).json(errorResponse("churchId is required"));
    }

    const counselors = await getCounselorsByChurch(churchId);
    res.json(
      successResponse("Counselors fetched successfully", { counselors }),
    );
  } catch (error: any) {
    res
      .status(500)
      .json(errorResponse(error.message || "Server error fetching counselors"));
  }
};

export const getOne = getCounselorDetails;
export const update = updateCounselorDetails;
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { updateAccountStatus } = await import("../services/accountService");
    const account = await updateAccountStatus(id as string, status);
    res.json(successResponse("Counselor status updated", { account }));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message || "Server error updating status"));
  }
};
