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
  console.log(
    "[ChurchAdminController] getDashboard - ChurchAdminId:",
    req.account?.id,
  );
  try {
    const dashboard = await getChurchAdminDashboard(req.account.id);
    console.log("[GET /api/church-admin/dashboard] Success");

    res.json(successResponse("Dashboard data fetched successfully", dashboard));
  } catch (error: any) {
    console.error("[GET /api/church-admin/dashboard] Failed:", error.message);
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
  console.log(
    "[ChurchAdminController] getMembers - ChurchAdminId:",
    req.account?.id,
  );
  try {
    const { verificationStatus, page, limit } = req.query;

    const result = await getChurchMembers(req.account.id, {
      verificationStatus: verificationStatus as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    console.log(
      "[GET /api/church-admin/me/members] Success - Count:",
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
    console.error("[GET /api/church-admin/me/members] Failed:", error.message);
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
  console.log(
    "[ChurchAdminController] assignCounselor - UserId:",
    req.body?.userId,
    "CounselorId:",
    req.body?.counselorId,
  );
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
    console.log(
      "[POST /api/church-admin/assign-counselor] Success - UserId:",
      userId,
    );

    res.json(
      successResponse("User assigned to counselor successfully", result),
    );
  } catch (error: any) {
    console.error(
      "[POST /api/church-admin/assign-counselor] Failed:",
      error.message,
    );
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
  console.log(
    "[ChurchAdminController] createChurchAdminAccount - ChurchId:",
    req.body?.churchId,
    "Email:",
    req.body?.email,
  );
  try {
    const { churchId, email, password, firstName, lastName, phone } = req.body;

    if (!churchId || !email || !password || !firstName || !lastName) {
      console.error(
        "[POST /api/church-admin/create-account] Failed: Missing required fields",
      );
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
    console.log(
      "[POST /api/church-admin/create] Success - ChurchAdminId:",
      result.account.id,
    );

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
    console.error("[POST /api/church-admin/create] Failed:", error.message);
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
  console.log("[GET /api/church-admins] Starting");
  try {
    const { status, churchId, page, limit } = req.query;

    const result = await getChurchAdmins({
      status: status as string,
      churchId: churchId as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    console.log(
      "[GET /api/church-admins] Success - Count:",
      result.churchAdmins.length,
    );

    res.json(
      successResponse(
        "Church admins fetched successfully",
        { churchAdmins: result.churchAdmins },
        result.pagination,
      ),
    );
  } catch (error: any) {
    console.error("[GET /api/church-admins] Failed:", error.message);
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
  console.log(
    "[ChurchAdminController] getChurchAdminDetails - Id:",
    req.params?.id,
  );
  try {
    const { id } = req.params;

    const churchAdmin = await getChurchAdminById(id);
    console.log("[GET /api/church-admins/:id] Success - Id:", churchAdmin.id);

    res.json(
      successResponse("Church admin fetched successfully", { churchAdmin }),
    );
  } catch (error: any) {
    console.error("[GET /api/church-admins/:id] Failed:", error.message);

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
