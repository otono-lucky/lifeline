import jwt from "jsonwebtoken";
import env from "../config/env";

export interface AccountPayload {
  id: string;
  email: string;
  role: string;
  firstName?: string;
}

export const generateToken = (account: AccountPayload) => {
  return jwt.sign(
      {
        id: account.id,
        email: account.email,
        role: account.role,
        firstName: account.firstName || ""
      },
      env.jwtSecret,
      {
        expiresIn: "30d",
      },
    );
}