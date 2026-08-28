// middleware/requireRole.ts
// Role-based access control middleware

/**
 * Middleware to check if user has required role
 * Must be used AFTER authMiddleware
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req, res, next) => {
    if (!req.account) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.account.role)) {
      return res.status(403).json({
        message: "Access denied. Insufficient permissions.",
        required: allowedRoles,
        current: req.account.role,
      });
    }

    next();
  };
};

export const requireSuperAdmin = requireRole(["SuperAdmin"]);
export const requireChurchAdmin = requireRole(["ChurchAdmin"]);
export const requireCounselor = requireRole(["Counselor"]);
export const requireAnyAdmin = requireRole(["SuperAdmin", "ChurchAdmin"]);

export default requireRole;