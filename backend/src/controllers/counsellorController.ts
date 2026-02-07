// controllers/counselor.controller.ts
// Counselor resource endpoints

import { Request, Response } from "express";
import {
  getCounselorsByChurch,
  getCounselorById,
  updateCounselor,
} from "../services/counsellorService";
import { updateAccountStatus } from "../services/accountService";
import { prisma } from "../config/db";

/**
 * @desc    Get counselors for a church
 * @route   GET /api/counselors
 * @access  ChurchAdmin (own church), SuperAdmin (any church)
 */
export const list = async (req: Request, res: Response) => {
  try {
    const { churchId } = req.query;

    let targetChurchId: string;

    // If SuperAdmin, churchId is required in query
    if (req.account.role === "SuperAdmin") {
      if (!churchId) {
        return res.status(400).json({
          message: "churchId query parameter is required for SuperAdmin",
        });
      }
      targetChurchId = churchId as string;
    } else {
      // ChurchAdmin - get their own church
      const churchAdmin = await prisma.churchAdmin.findUnique({
        where: { accountId: req.account.id },
      });

      if (!churchAdmin) {
        return res.status(403).json({
          message: "Church admin profile not found",
        });
      }

      targetChurchId = churchAdmin.churchId;
    }

    const counselors = await getCounselorsByChurch(targetChurchId);

    res.json({ counselors });
  } catch (error: any) {
    console.error("List counselors error:", error);
    res.status(500).json({
      message: error.message || "Server error fetching counselors",
    });
  }
};

/**
 * @desc    Get single counselor
 * @route   GET /api/counselors/:id
 * @access  ChurchAdmin, SuperAdmin, Counselor (own profile)
 */
export const getOne = async (req: Request, res: Response) => {
  try {
    const id = String(req.params?.id)

    const counselor = await getCounselorById(id);

    res.json({ counselor });
  } catch (error: any) {
    console.error("Get counselor error:", error);

    if (error.message === "Counselor not found") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({
      message: error.message || "Server error fetching counselor",
    });
  }
};

/**
 * @desc    Update counselor details
 * @route   PUT /api/counselors/:id
 * @access  ChurchAdmin, Counselor (own profile)
 */
export const update = async (req: Request, res: Response) => {
  try {
    const id  = String(req.params.id);
    const { bio, yearsExperience } = req.body;

    const counselor = await updateCounselor(id, {
      bio,
      yearsExperience: yearsExperience
        ? parseInt(yearsExperience)
        : undefined,
    });

    res.json({
      message: "Counselor updated successfully",
      counselor,
    });
  } catch (error: any) {
    console.error("Update counselor error:", error);
    res.status(500).json({
      message: error.message || "Server error updating counselor",
    });
  }
};

/**
 * @desc    Suspend/activate counselor account
 * @route   PATCH /api/counselors/:id/status
 * @access  ChurchAdmin, SuperAdmin
 */
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const id = String(req.params?.id)
    const { status } = req.body;

    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be: active or suspended",
      });
    }

    // Get counselor to find their accountId
    const counselor = await prisma.counselor.findUnique({
      where: { id },
      select: { accountId: true },
    });

    if (!counselor) {
      return res.status(404).json({
        message: "Counselor not found",
      });
    }

    // Update account status (not counselor status - we removed that)
    const account = await updateAccountStatus(counselor.accountId, status);

    res.json({
      message: `Counselor ${status === "active" ? "activated" : "suspended"} successfully`,
      status: account.status,
    });
  } catch (error: any) {
    console.error("Update counselor status error:", error);
    res.status(500).json({
      message: error.message || "Server error updating counselor status",
    });
  }
};