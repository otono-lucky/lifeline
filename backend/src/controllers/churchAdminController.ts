// controllers/churchAdminController.ts
// ChurchAdmin endpoints with unified responses

import { Request, Response } from "express";
import {
  getChurchAdminDashboard,
  assignUserToCounselor,
  getChurchAdmins,
  getChurchAdminById,
  updateChurchAdmin,
} from "../services/churchAdminService";
import { createChurchAdmin } from "../services/accountService";
import { generateToken } from "../utils/tokenManager";
import { successResponse, errorResponse } from "../utils/responseHandler";
import { Params } from "../types/express";

/**
 * @desc    Get ChurchAdmin dashboard
 * @route   GET /api/church-admin/dashboard
 * @access  ChurchAdmin, SuperAdmin
 */
export const getDashboard = async (req: Request, res: Response) => {
  try {
    const dashboard = await getChurchAdminDashboard(
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
    res
      .status(400)
      .json(errorResponse(error.message || "Server error assigning counselor"));
  }
};

/**
 * @desc    Create church admin account (1:1 with Church + optional title)
 * @route   POST /api/church-admin/create
 * @access  SuperAdmin
 */
export const createChurchAdminAccount = async (req: Request, res: Response) => {
  try {
    const { churchId, email, password, firstName, lastName, phone, title } = req.body;

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
      title,
      role: "ChurchAdmin",
    });

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
          accountId: result.account.id,
          churchId: result.churchAdmin.churchId,
          title: result.churchAdmin.title,
        },
        token,
      }),
    );
  } catch (error: any) {
    res
      .status(500)
      .json(
        errorResponse(error.message || "Server error creating church admin"),
      );
  }
};

/**
 * @desc    List all church admins
 * @route   GET /api/church-admin
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
    res
      .status(500)
      .json(
        errorResponse(error.message || "Server error fetching church admins"),
      );
  }
};

/**
 * @desc    Get church admin details
 * @route   GET /api/church-admin/:id
 * @access  SuperAdmin, ChurchAdmin
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

/**
 * @desc    Update ChurchAdmin title or profile
 * @route   PUT /api/church-admin/:id
 * @access  ChurchAdmin, SuperAdmin
 */
export const updateChurchAdminProfile = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = req.params.id as string;
    const { title } = req.body;

    const result = await updateChurchAdmin(id, { title });
    res.json(successResponse("Church admin profile updated", result));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message || "Failed to update church admin"));
  }
};
