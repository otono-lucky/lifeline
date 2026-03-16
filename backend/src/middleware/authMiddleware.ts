import jwt from "jsonwebtoken";
import env from "../config/env";
import { prisma } from "../config/db";
import { AccountPayload } from "../utils/tokenManager";

export default async (req, res, next) => {
  // Get token from header
  const token = req.header("Authorization")?.split(" ")[1];

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as AccountPayload;

    // const account = await prisma.account.findUnique({
    //   where: { id: decoded.?id },
    //   select: {
    //     id: true,
    //     email: true,
    //     firstName: true,
    //     lastName: true,
    //     phone: true,
    //     role: true,
    //     isEmailVerified: true,
    //     status: true,
    //     createdAt: true,
    //   },
    // });

    // if (!account) {
    //   return res.status(401).json({ message: "Account does not exist" });
    // }

    // if (account.status === "suspended") {
    //   return res
    //     .status(403)
    //     .json({ message: "Your account has been suspended" });
    // }

    //  if (account.status === "pending") {
    //   return res.status(403).json({ message: "Account has not been activated yet" });
    // }

    // req.account = account;
    req.account = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
