// controllers/churchAdminController.ts
// ChurchAdmin endpoints with unified responses

import { Request, Response } from "express";
import {
  getChurchAdminDashboard,
  assignUserToCounselor,
  getChurchAdmins,
  getChurchAdminById,
} from "../services/churchAdminService";
import { getChurchMembers } from "../services/churchService";
import { createChurchAdmin } from "../services/accountService";
import { generateToken } from "../utils/tokenManager";
import { successResponse, errorResponse } from "../utils/responseHandler";
import { Params } from "../types/express";

/**
 * @desc    Get ChurchAdmin dashboard
 * @route   GET /api/church-admin/dashboard
 * @access  ChurchAdmin
 */
export const getDashboard = async (req: Request, res: Response) => {
  try {
    const dashboard = await getChurchAdminDashboard(req.account.id);

    res.json(successResponse("Dashboard data fetched successfully", dashboard));
  } catch (error: any) {
    console.error("Get dashboard error:", error);
    res
      .status(500)
      .json(errorResponse(error.message || "Server error fetching dashboard"));
  }
};

/**
 * @desc    Get church members
 * @route   GET /api/church-admin/me/members
 * @access  ChurchAdmin
 */
export const getMembers = async (req: Request, res: Response) => {
  try {
    const { verificationStatus, page, limit } = req.query;

    const result = await getChurchMembers(req.account.id, {
      verificationStatus: verificationStatus as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json(
      successResponse(
        "Members fetched successfully",
        { members: result.members },
        result.pagination,
      ),
    );
  } catch (error: any) {
    console.error("Get members error:", error);
    res
      .status(500)
      .json(errorResponse(error.message || "Server error fetching members"));
  }
};

/**
 * @desc    Assign user to counselor
 * @route   POST /api/church-admin/assign-counselor
 * @access  ChurchAdmin
 */
export const assignCounselor = async (req: Request, res: Response) => {
  try {
    const { userId, counselorId } = req.body;

    if (!userId || !counselorId) {
      return res
        .status(400)
        .json(errorResponse("userId and counselorId are required"));
    }

    const result = await assignUserToCounselor(
      req.account.id,
      userId,
      counselorId,
    );

    res.json(
      successResponse("User assigned to counselor successfully", result),
    );
  } catch (error: any) {
    console.error("Assign counselor error:", error);
    res
      .status(400)
      .json(errorResponse(error.message || "Server error assigning counselor"));
  }
};

/**
 * @desc    Create church admin account
 * @route   POST /api/church-admin/create
 * @access  SuperAdmin
 */
export const createChurchAdminAccount = async (req: Request, res: Response) => {
  try {
    const { churchId, email, password, firstName, lastName, phone } = req.body;

    if (!churchId || !email || !password || !firstName || !lastName) {
      return res.status(400).json(
        errorResponse("Missing required fields", {
          required: ["churchId", "email", "password", "firstName", "lastName"],
        }),
      );
    }

    const result = await createChurchAdmin({
      churchId,
      email,
      password,
      firstName,
      lastName,
      phone,
      role: "ChurchAdmin",
    });

    // Generate login token
    const token = generateToken({
      id: result.account.id,
      email: result.account.email,
      role: result.account.role,
      firstName: result.account.firstName,
    });

    res.status(201).json(
      successResponse("Church admin account created successfully", {
        account: {
          id: result.account.id,
          email: result.account.email,
          firstName: result.account.firstName,
          lastName: result.account.lastName,
          role: result.account.role,
        },
        churchAdmin: {
          id: result.churchAdmin.id, // resource ID
          accountId: result.account.id, // link to account
          churchId: result.churchAdmin.churchId,
        },
        token,
      }),
    );
  } catch (error: any) {
    console.error("Create church admin error:", error);
    res
      .status(500)
      .json(
        errorResponse(error.message || "Server error creating church admin"),
      );
  }
};

/**
 * @desc    List all church admins
 * @route   GET /api/church-admins
 * @access  SuperAdmin
 */
export const listChurchAdmins = async (req: Request, res: Response) => {
  try {
    const { status, churchId, page, limit } = req.query;

    const result = await getChurchAdmins({
      status: status as string,
      churchId: churchId as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json(
      successResponse(
        "Church admins fetched successfully",
        { churchAdmins: result.churchAdmins },
        result.pagination,
      ),
    );
  } catch (error: any) {
    console.error("List church admins error:", error);
    res
      .status(500)
      .json(
        errorResponse(error.message || "Server error fetching church admins"),
      );
  }
};

/**
 * @desc    Get church admin details
 * @route   GET /api/church-admins/:id
 * @access  SuperAdmin
 */
export const getChurchAdminDetails = async (
  req: Request<Params>,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const churchAdmin = await getChurchAdminById(id);

    res.json(
      successResponse("Church admin fetched successfully", { churchAdmin }),
    );
  } catch (error: any) {
    console.error("Get church admin error:", error);

    if (error.message === "Church admin not found") {
      return res.status(404).json(errorResponse(error.message));
    }

    res
      .status(500)
      .json(
        errorResponse(error.message || "Server error fetching church admin"),
      );
  }
};
