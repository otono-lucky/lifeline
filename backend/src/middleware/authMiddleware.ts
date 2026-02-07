import jwt from "jsonwebtoken";
import env from "../config/env";

export default (req, res, next) => {
  // Get token from header
  const token = req.header("Authorization")?.split(" ")[1];

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.account = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
