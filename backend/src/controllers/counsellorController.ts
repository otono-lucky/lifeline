// controllers/counselorController.ts
// Counselor endpoints with unified responses

import { Request, Response } from "express";
import {
  getCounselorDashboard,
  getAssignedUsers,
  verifyUser,
  getCounselorsByChurch,
  getCounselorById,
  updateCounselor,
} from "../services/counsellorService";
import { createCounselor } from "../services/accountService";
import { updateAccountStatus } from "../services/accountService";
import { generateToken } from "../utils/tokenManager";
import { successResponse, errorResponse } from "../utils/responseHandler";
import { prisma } from "../config/db";
import { Params } from "../types/express";

/**
 * @desc    Get counselor dashboard
 * @route   GET /api/counselor/dashboard
 * @access  Counselor
 */
export const getDashboard = async (req: Request, res: Response) => {
  try {
    const dashboard = await getCounselorDashboard(req.account.id);

    res.json(
      successResponse("Dashboard data fetched successfully", dashboard)
    );
  } catch (error: any) {
    console.error("Get dashboard error:", error);
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
export const getMyAssignedUsers = async (req: Request, res: Response) => {
  try {
    const { verificationStatus, page, limit } = req.query;

    const result = await getAssignedUsers(req.account.id, {
      verificationStatus: verificationStatus as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json(
      successResponse(
        "Assigned users fetched successfully",
        { users: result.users },
        result.pagination
      )
    );
  } catch (error: any) {
    console.error("Get assigned users error:", error);
    res
      .status(500)
      .json(
        errorResponse(error.message || "Server error fetching assigned users")
      );
  }
};

/**
 * @desc    Verify or reject user
 * @route   POST /api/counselor/verify-user/:userId
 * @access  Counselor
 */
export const verifyUserStatus = async (req: Request<{userId: string}>, res: Response) => {
  try {
    const { userId } = req.params;
    const { status, notes } = req.body;

    if (!status || !["verified", "rejected"].includes(status)) {
      return res
        .status(400)
        .json(
          errorResponse("Invalid status. Must be 'verified' or 'rejected'")
        );
    }

    const result = await verifyUser(req.account.id, userId, status, notes);

    res.json(
      successResponse(
        `User ${status === "verified" ? "verified" : "rejected"} successfully`,
        result
      )
    );
  } catch (error: any) {
    console.error("Verify user error:", error);
    res
      .status(400)
      .json(errorResponse(error.message || "Server error verifying user"));
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
      yearsExperience,
    } = req.body;

    if (!churchId || !email || !password || !firstName || !lastName) {
      return res.status(400).json(
        errorResponse("Missing required fields", {
          required: ["churchId", "email", "password", "firstName", "lastName"],
        })
      );
    }

    const result = await createCounselor({
      churchId,
      email,
      password,
      firstName,
      lastName,
      phone,
      bio,
      yearsExperience: yearsExperience
        ? parseInt(yearsExperience)
        : undefined,
      role: "Counselor",
    });

    // Generate login token
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
          id: result.counselor.id,
          bio: result.counselor.bio,
          yearsExperience: result.counselor.yearsExperience,
        },
        token,
      })
    );
  } catch (error: any) {
    console.error("Create counselor error:", error);
    res
      .status(500)
      .json(errorResponse(error.message || "Server error creating counselor"));
  }
};

/**
 * @desc    Get counselors for a church
 * @route   GET /api/counselor/list
 * @access  ChurchAdmin, SuperAdmin
 */
export const list = async (req: Request, res: Response) => {
  try {
    const { churchId } = req.query;

    let targetChurchId: string;

    // If SuperAdmin, churchId is required in query
    if (req.account.role === "SuperAdmin") {
      if (!churchId) {
        return res.status(400).json(
          errorResponse("churchId query parameter is required for SuperAdmin")
        );
      }
      targetChurchId = churchId as string;
    } else {
      // ChurchAdmin - get their own church
      const churchAdmin = await prisma.churchAdmin.findUnique({
        where: { accountId: req.account.id },
      });

      if (!churchAdmin) {
        return res.status(403).json(
          errorResponse("Church admin profile not found")
        );
      }

      targetChurchId = churchAdmin.churchId;
    }

    const counselors = await getCounselorsByChurch(targetChurchId);

    res.json(successResponse("Counselors fetched successfully", { counselors }));
  } catch (error: any) {
    console.error("List counselors error:", error);
    res
      .status(500)
      .json(errorResponse(error.message || "Server error fetching counselors"));
  }
};

/**
 * @desc    Get single counselor
 * @route   GET /api/counselor/:id
 * @access  ChurchAdmin, SuperAdmin, Counselor (own profile)
 */
export const getOne = async (req: Request<Params>, res: Response) => {
  try {
    const { id } = req.params;

    const counselor = await getCounselorById(id);

    res.json(successResponse("Counselor fetched successfully", { counselor }));
  } catch (error: any) {
    console.error("Get counselor error:", error);

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
 * @access  ChurchAdmin, Counselor (own profile)
 */
export const update = async (req: Request<Params>, res: Response) => {
  try {
    const { id } = req.params;
    const { bio, yearsExperience } = req.body;

    const counselor = await updateCounselor(id, {
      bio,
      yearsExperience: yearsExperience
        ? parseInt(yearsExperience)
        : undefined,
    });

    res.json(
      successResponse("Counselor updated successfully", { counselor })
    );
  } catch (error: any) {
    console.error("Update counselor error:", error);
    res
      .status(500)
      .json(errorResponse(error.message || "Server error updating counselor"));
  }
};

/**
 * @desc    Suspend/activate counselor account
 * @route   PATCH /api/counselor/:id/status
 * @access  ChurchAdmin, SuperAdmin
 */
export const updateStatus = async (req: Request<Params>, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "suspended"].includes(status)) {
      return res
        .status(400)
        .json(errorResponse("Invalid status. Must be: active or suspended"));
    }

    // Get counselor to find their accountId
    const counselor = await prisma.counselor.findUnique({
      where: { id },
      select: { accountId: true },
    });

    if (!counselor) {
      return res.status(404).json(errorResponse("Counselor not found"));
    }

    // Update account status
    const account = await updateAccountStatus(counselor.accountId, status);

    res.json(
      successResponse(
        `Counselor ${status === "active" ? "activated" : "suspended"} successfully`,
        { status: account.status }
      )
    );
  } catch (error: any) {
    console.error("Update counselor status error:", error);
    res
      .status(500)
      .json(
        errorResponse(error.message || "Server error updating counselor status")
      );
  }
};
