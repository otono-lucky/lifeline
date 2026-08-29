import jwt from "jsonwebtoken";
import env from "../config/env";
import { prisma } from "../config/db";
import { AccountPayload } from "../utils/tokenManager";

export default async (req, res, next) => {
  // Get token from header
  const token = req.header("Authorization")?.split(" ")[1];

  // Check if no token
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token, authorization denied",
      data: null,
      errors: null,
    });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as AccountPayload;
    req.account = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: "Token is not valid",
      data: null,
      errors: null,
    });
  }
};
