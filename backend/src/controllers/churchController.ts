// controllers/church.controller.ts
// Church resource endpoints

import { Request, Response } from "express";
import {
  createChurch,
  getChurches,
  getChurchById,
  updateChurch,
} from "../services/churchService";
import { prisma } from "../config/db";

/**
 * @desc    Create a new church
 * @route   POST /api/churches
 * @access  SuperAdmin
 */
export const create = async (req: Request, res: Response) => {
  try {
    const { officialName, aka, email, phone, state, lga, city, address } =
      req.body;

    // Validation
    if (!officialName || !email || !phone || !state) {
      return res.status(400).json({
        message: "Missing required fields: officialName, email, phone, state",
      });
    }

    // Get SuperAdmin
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { accountId: req.account.id },
    });

    if (!superAdmin) {
      return res.status(403).json({
        message: "SuperAdmin profile not found",
      });
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

    res.status(201).json({
      message: "Church created successfully",
      church,
    });
  } catch (error: any) {
    console.error("Create church error:", error);
    res.status(500).json({
      message: error.message || "Server error creating church",
    });
  }
};

/**
 * @desc    Get all churches
 * @route   GET /api/churches
 * @access  SuperAdmin
 */
export const list = async (req: Request, res: Response) => {
  try {
    const { status, page, limit } = req.query;

    const result = await getChurches({
      status: status as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json(result);
  } catch (error: any) {
    console.error("List churches error:", error);
    res.status(500).json({
      message: error.message || "Server error fetching churches",
    });
  }
};

/**
 * @desc    Get single church
 * @route   GET /api/churches/:id
 * @access  SuperAdmin, ChurchAdmin (own church)
 */
export const getOne = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const church = await getChurchById(id);

    res.json({ church });
  } catch (error: any) {
    console.error("Get church error:", error);

    if (error.message === "Church not found") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({
      message: error.message || "Server error fetching church",
    });
  }
};

/**
 * @desc    Update church details
 * @route   PUT /api/churches/:id
 * @access  SuperAdmin
 */
export const update = async (req: Request, res: Response) => {
  try {
    const id = String(req.params?.id)
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

    res.json({
      message: "Church updated successfully",
      church,
    });
  } catch (error: any) {
    console.error("Update church error:", error);
    res.status(500).json({
      message: error.message || "Server error updating church",
    });
  }
};