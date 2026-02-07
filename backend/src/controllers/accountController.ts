// controllers/account.controller.ts
// Account resource endpoints (creating admins, counselors)

import { Request, Response } from "express";
import {
  createChurchAdmin,
  createCounselor,
} from "../services/accountService";
import { generateToken } from "../utils/tokenManager";

/**
 * @desc    Create church admin account
 * @route   POST /api/accounts/church-admins
 * @access  SuperAdmin
 */
export const createChurchAdminAccount = async (
  req: Request,
  res: Response
) => {
  try {
    const { churchId, email, password, firstName, lastName, phone } = req.body;

    // Validation
    if (!churchId || !email || !password || !firstName || !lastName) {
      return res.status(400).json({
        message:
          "Missing required fields: churchId, email, password, firstName, lastName",
      });
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

    res.status(201).json({
      message: "Church admin account created successfully",
      account: {
        id: result.account.id,
        email: result.account.email,
        firstName: result.account.firstName,
        lastName: result.account.lastName,
        role: result.account.role,
      },
      token, // Admin can login immediately
    });
  } catch (error: any) {
    console.error("Create church admin error:", error);
    res.status(500).json({
      message: error.message || "Server error creating church admin",
    });
  }
};

/**
 * @desc    Create counselor account
 * @route   POST /api/accounts/counselors
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

    // Validation
    if (!churchId || !email || !password || !firstName || !lastName) {
      return res.status(400).json({
        message:
          "Missing required fields: churchId, email, password, firstName, lastName",
      });
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

    res.status(201).json({
      message: "Counselor account created successfully",
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
      token, // Counselor can login immediately
    });
  } catch (error: any) {
    console.error("Create counselor error:", error);
    res.status(500).json({
      message: error.message || "Server error creating counselor",
    });
  }
};