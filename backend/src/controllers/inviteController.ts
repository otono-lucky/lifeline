import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../config/db";
import env from "../config/env";
import { successResponse, errorResponse } from "../utils/responseHandler";

// ============= STEP 1: CREATE INVITE (JWT PROTECTED) =============

// @desc    Create invite for ChurchAdmin or Counselor
// @route   POST /api/invites
// @access  SuperAdmin (for ChurchAdmin) or ChurchAdmin (for Counselor)
export const createInvite = async (req, res) => {
  try {
    const { email, inviteType, churchId } = req.body;

    // Validation
    if (!email || !inviteType) {
      return res
        .status(400)
        .json(errorResponse("Email and inviteType are required"));
    }

    if (!["ChurchAdmin", "Counselor"].includes(inviteType)) {
      return res
        .status(400)
        .json(
          errorResponse("Invalid invite type. Must be ChurchAdmin or Counselor")
        );
    }

    // Authorization check
    const account = await prisma.account.findUnique({
      where: { id: req.account.id },
      include: { superAdmin: true, churchAdmin: true },
    });

    // SuperAdmin can create ChurchAdmin invites
    if (inviteType === "ChurchAdmin") {
      if (account.role !== "SuperAdmin") {
        return res
          .status(403)
          .json(errorResponse("Only SuperAdmin can invite ChurchAdmins"));
      }
      if (!churchId) {
        return res
          .status(400)
          .json(
            errorResponse("churchId is required for ChurchAdmin invites")
          );
      }
    }

    // ChurchAdmin can create Counselor invites (for their church only)
    if (inviteType === "Counselor") {
      if (account.role !== "ChurchAdmin" && account.role !== "SuperAdmin") {
        return res
          .status(403)
          .json(
            errorResponse("Only ChurchAdmin or Admin can invite Counselors")
          );
      }
      // Use ChurchAdmin's church
      if (!account.churchAdmin) {
        return res
          .status(403)
          .json(errorResponse("Church admin profile not found"));
      }
      // Override churchId with admin's church
      req.body.churchId = account.churchAdmin.churchId;
    }

    // Check if email already has an account
    const existingAccount = await prisma.account.findUnique({
      where: { email },
    });

    if (existingAccount) {
      return res
        .status(409)
        .json(errorResponse("An account with this email already exists"));
    }

    // Check if there's already a pending invite for this email
    const existingInvite = await prisma.invite.findFirst({
      where: {
        email,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvite) {
      return res
        .status(409)
        .json(errorResponse("An active invite already exists for this email"));
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Create invite
    const invite = await prisma.invite.create({
      data: {
        token,
        type: inviteType,
        email,
        churchId: req.body.churchId,
        createdByAccountId: req.account.id,
        expiresAt,
      },
      include: {
        church: {
          select: {
            officialName: true,
            aka: true,
          },
        },
      },
    });

    // Generate invite link
    const inviteLink = `${env.clientUrl}/register?token=${token}`;

    // TODO: Send email
    console.log("Send invite email to:", email);
    console.log("Invite link:", inviteLink);
    console.log("Type:", inviteType);
    console.log("Church:", invite.church?.officialName);

    res.status(201).json(
      successResponse("Invite created successfully", {
        invite: {
          id: invite.id,
          email: invite.email,
          type: invite.type,
          church: invite.church,
          expiresAt: invite.expiresAt,
          inviteLink, // Remove in production
        },
      })
    );
  } catch (error) {
    console.error("Create invite error:", error);
    res
      .status(500)
      .json(errorResponse("Server error creating invite"));
  }
};

// ============= STEP 2: VALIDATE INVITE (PUBLIC) =============

// @desc    Validate invite token
// @route   GET /api/invites/validate
// @access  Public
export const validateInvite = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json(errorResponse("Token is required"));
    }

    const invite = await prisma.invite.findUnique({
      where: { token: String(token) },
      include: {
        church: {
          select: {
            id: true,
            officialName: true,
            aka: true,
          },
        },
      },
    });

    if (!invite) {
      return res.status(404).json(errorResponse("Invalid invite token"));
    }

    // Check if already used
    if (invite.used) {
      return res
        .status(400)
        .json(errorResponse("This invite has already been used"));
    }

    // Check if expired
    if (new Date() > invite.expiresAt) {
      return res.status(400).json(errorResponse("This invite has expired"));
    }

    // Return invite context (DO NOT mark as used)
    res.json(
      successResponse("Invite is valid", {
        valid: true,
        invite: {
          type: invite.type,
          email: invite.email,
          church: invite.church,
          expiresAt: invite.expiresAt,
        },
      })
    );
  } catch (error) {
    console.error("Validate invite error:", error);
    res
      .status(500)
      .json(errorResponse("Server error validating invite"));
  }
};

// ============= STEP 3: REGISTER WITH INVITE (PUBLIC) =============

// @desc    Complete registration using invite token
// @route   POST /api/invites/register
// @access  Public
export const registerWithInvite = async (req, res) => {
  try {
    const { token, email, firstName, lastName, password, phone } = req.body;

    // Validation
    if (!token || !email || !firstName || !lastName || !password) {
      return res
        .status(400)
        .json(
          errorResponse(
            "Missing required fields: token, email, firstName, lastName, password"
          )
        );
    }

    // Find invite
    const invite = await prisma.invite.findUnique({
      where: { token },
      include: { church: true },
    });

    if (!invite) {
      return res.status(404).json(errorResponse("Invalid invite token"));
    }

    // Validate invite
    if (invite.used) {
      return res.status(400).json(errorResponse("Invite already used"));
    }

    if (new Date() > invite.expiresAt) {
      return res.status(400).json(errorResponse("Invite expired"));
    }

    // Verify email matches invite
    if (email !== invite.email) {
      return res.status(400).json(errorResponse("Email does not match invite"));
    }

    // Check if account exists
    const existingAccount = await prisma.account.findUnique({
      where: { email },
    });

    if (existingAccount) {
      return res
        .status(409)
        .json(errorResponse("Account with this email already exists"));
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Determine role from invite type
    const role = invite.type === "ChurchAdmin" ? "ChurchAdmin" : "Counselor";

    // Create account + profile in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create account
      const account = await tx.account.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          role,
          status: "active",
        },
      });

      // 2. Create role-specific profile
      if (invite.type === "ChurchAdmin") {
        await tx.churchAdmin.create({
          data: {
            accountId: account.id,
            churchId: invite.churchId,
          },
        });

        // Activate church when first admin joins
        await tx.church.update({
          where: { id: invite.churchId },
          data: { status: "active" },
        });
      } else if (invite.type === "Counselor") {
        await tx.counselor.create({
          data: {
            accountId: account.id,
            churchId: invite.churchId,
          },
        });
      }

      // 3. Mark invite as used
      await tx.invite.update({
        where: { id: invite.id },
        data: {
          used: true,
          usedAt: new Date(),
        },
      });

      return account;
    });

    // Generate JWT for auto-login
    const jwtToken = jwt.sign(
      {
        id: result.id,
        email: result.email,
        role: result.role,
      },
      env.jwtSecret,
      { expiresIn: "30d" }
    );

    res.status(201).json(
      successResponse("Registration successful", {
        token: jwtToken,
        user: {
          id: result.id,
          email: result.email,
          firstName: result.firstName,
          lastName: result.lastName,
          role: result.role,
        },
        church: invite.church
          ? {
              id: invite.church.id,
              name: invite.church.officialName,
            }
          : null,
      })
    );
  } catch (error) {
    console.error("Register with invite error:", error);
    res
      .status(500)
      .json(errorResponse("Server error during registration"));
  }
};

// ============= ADMIN: CREATE CHURCH (SUPER ADMIN ONLY) =============

// @desc    Create church and auto-send ChurchAdmin invite
// @route   POST /api/admin/churches
// @access  SuperAdmin only
export const createChurch = async (req, res) => {
  try {
    const {
      officialName,
      aka,
      churchEmail,
      phone,
      state,
      lga,
      city,
      address,
      adminEmail, // Optional - defaults to churchEmail
    } = req.body;

    // Validation
    if (!officialName || !churchEmail || !phone || !state) {
      return res
        .status(400)
        .json(
          errorResponse(
            "Missing required fields: officialName, churchEmail, phone, state"
          )
        );
    }

    // Get SuperAdmin
    const account = await prisma.account.findUnique({
      where: { id: req.account.id },
      include: { superAdmin: true },
    });

    if (!account || !account.superAdmin) {
      return res
        .status(403)
        .json(errorResponse("Only SuperAdmin can create churches"));
    }

    // Check if church exists
    const existingChurch = await prisma.church.findUnique({
      where: { email: churchEmail },
    });

    if (existingChurch) {
      return res
        .status(409)
        .json(errorResponse("Church with this email already exists"));
    }

    // Create church
    const church = await prisma.church.create({
      data: {
        officialName,
        aka,
        email: churchEmail,
        phone,
        state,
        lga,
        city,
        address,
        status: "pending", // Pending until admin registers
        createdBy: account.superAdmin.id,
      },
    });

    // Auto-create invite for church admin
    const inviteEmail = adminEmail || churchEmail;
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await prisma.invite.create({
      data: {
        token,
        type: "ChurchAdmin",
        email: inviteEmail,
        churchId: church.id,
        createdByAccountId: req.account.id,
        expiresAt,
      },
    });

    // Generate invite link
    const inviteLink = `${process.env.FRONTEND_URL}/register?token=${token}`;

    // TODO: Send email
    console.log("Send church admin invite to:", inviteEmail);
    console.log("Invite link:", inviteLink);

    res.status(201).json(
      successResponse("Church created and invite sent", {
        church: {
          id: church.id,
          name: church.officialName,
          email: church.email,
          status: church.status,
        },
        invite: {
          sentTo: inviteEmail,
          expiresAt,
          inviteLink, // Remove in production
        },
      })
    );
  } catch (error) {
    console.error("Create church error:", error);
    res.status(500).json(errorResponse("Server error creating church"));
  }
};

// ============= ADMIN: LIST CHURCHES =============

// @desc    Get all churches
// @route   GET /api/admin/churches
// @access  SuperAdmin only
export const getChurches = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;
    const where = status ? { status } : {};

    const [churches, total] = await Promise.all([
      prisma.church.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { createdAt: "desc" },
        include: {
          churchAdmins: {
            include: {
              account: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          invites: {
            where: {
              type: "ChurchAdmin",
              used: false,
            },
            select: {
              email: true,
              expiresAt: true,
            },
          },
        },
      }),
      prisma.church.count({ where }),
    ]);

    res.json(
      successResponse(
        "Churches fetched successfully",
        { churches },
        {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber),
        }
      )
    );
  } catch (error) {
    console.error("Get churches error:", error);
    res
      .status(500)
      .json(errorResponse("Server error fetching churches"));
  }
};
