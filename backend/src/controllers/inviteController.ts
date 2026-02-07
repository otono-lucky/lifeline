import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../config/db";
import env from "../config/env";

// ============= STEP 1: CREATE INVITE (JWT PROTECTED) =============

// @desc    Create invite for ChurchAdmin or Counselor
// @route   POST /api/invites
// @access  SuperAdmin (for ChurchAdmin) or ChurchAdmin (for Counselor)
export const createInvite = async (req, res) => {
  try {
    const { email, inviteType, churchId } = req.body;

    // Validation
    if (!email || !inviteType) {
      return res.status(400).json({
        message: "Email and inviteType are required",
      });
    }

    if (!["ChurchAdmin", "Counselor"].includes(inviteType)) {
      return res.status(400).json({
        message: "Invalid invite type. Must be ChurchAdmin or Counselor",
      });
    }

    // Authorization check
    const account = await prisma.account.findUnique({
      where: { id: req.account.id },
      include: { superAdmin: true, churchAdmin: true },
    });

    // SuperAdmin can create ChurchAdmin invites
    if (inviteType === "ChurchAdmin") {
      if (account.role !== "SuperAdmin") {
        return res.status(403).json({
          message: "Only SuperAdmin can invite ChurchAdmins",
        });
      }
      if (!churchId) {
        return res.status(400).json({
          message: "churchId is required for ChurchAdmin invites",
        });
      }
    }

    // ChurchAdmin can create Counselor invites (for their church only)
    if (inviteType === "Counselor") {
      if (account.role !== "ChurchAdmin" && account.role !== "SuperAdmin") {
        return res.status(403).json({
          message: "Only ChurchAdmin or Admin can invite Counselors",
        });
      }
      // Use ChurchAdmin's church
      if (!account.churchAdmin) {
        return res.status(403).json({
          message: "Church admin profile not found",
        });
      }
      // Override churchId with admin's church
      req.body.churchId = account.churchAdmin.churchId;
    }

    // Check if email already has an account
    const existingAccount = await prisma.account.findUnique({
      where: { email },
    });

    if (existingAccount) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
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
      return res.status(409).json({
        message: "An active invite already exists for this email",
      });
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

    res.status(201).json({
      message: "Invite created successfully",
      invite: {
        id: invite.id,
        email: invite.email,
        type: invite.type,
        church: invite.church,
        expiresAt: invite.expiresAt,
        inviteLink, // Remove in production
      },
    });
  } catch (error) {
    console.error("Create invite error:", error);
    res.status(500).json({ message: "Server error creating invite" });
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
      return res.status(400).json({
        message: "Token is required",
      });
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
      return res.status(404).json({
        message: "Invalid invite token",
      });
    }

    // Check if already used
    if (invite.used) {
      return res.status(400).json({
        message: "This invite has already been used",
      });
    }

    // Check if expired
    if (new Date() > invite.expiresAt) {
      return res.status(400).json({
        message: "This invite has expired",
      });
    }

    // Return invite context (DO NOT mark as used)
    res.json({
      valid: true,
      invite: {
        type: invite.type,
        email: invite.email,
        church: invite.church,
        expiresAt: invite.expiresAt,
      },
    });
  } catch (error) {
    console.error("Validate invite error:", error);
    res.status(500).json({ message: "Server error validating invite" });
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
      return res.status(400).json({
        message:
          "Missing required fields: token, email, firstName, lastName, password",
      });
    }

    // Find invite
    const invite = await prisma.invite.findUnique({
      where: { token },
      include: { church: true },
    });

    if (!invite) {
      return res.status(404).json({ message: "Invalid invite token" });
    }

    // Validate invite
    if (invite.used) {
      return res.status(400).json({ message: "Invite already used" });
    }

    if (new Date() > invite.expiresAt) {
      return res.status(400).json({ message: "Invite expired" });
    }

    // Verify email matches invite
    if (email !== invite.email) {
      return res.status(400).json({
        message: "Email does not match invite",
      });
    }

    // Check if account exists
    const existingAccount = await prisma.account.findUnique({
      where: { email },
    });

    if (existingAccount) {
      return res.status(409).json({
        message: "Account with this email already exists",
      });
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

    res.status(201).json({
      message: "Registration successful",
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
    });
  } catch (error) {
    console.error("Register with invite error:", error);
    res.status(500).json({ message: "Server error during registration" });
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
      return res.status(400).json({
        message:
          "Missing required fields: officialName, churchEmail, phone, state",
      });
    }

    // Get SuperAdmin
    const account = await prisma.account.findUnique({
      where: { id: req.account.id },
      include: { superAdmin: true },
    });

    if (!account || !account.superAdmin) {
      return res.status(403).json({
        message: "Only SuperAdmin can create churches",
      });
    }

    // Check if church exists
    const existingChurch = await prisma.church.findUnique({
      where: { email: churchEmail },
    });

    if (existingChurch) {
      return res.status(409).json({
        message: "Church with this email already exists",
      });
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

    res.status(201).json({
      message: "Church created and invite sent",
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
    });
  } catch (error) {
    console.error("Create church error:", error);
    res.status(500).json({ message: "Server error creating church" });
  }
};

// ============= ADMIN: LIST CHURCHES =============

// @desc    Get all churches
// @route   GET /api/admin/churches
// @access  SuperAdmin only
export const getChurches = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = status ? { status } : {};

    const [churches, total] = await Promise.all([
      prisma.church.findMany({
        where,
        skip,
        take: parseInt(limit),
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

    res.json({
      churches,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get churches error:", error);
    res.status(500).json({ message: "Server error fetching churches" });
  }
};