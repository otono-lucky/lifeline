// middleware/requireRole.js
// Role-based access control middleware

/**
 * Middleware to check if user has required role
 * Must be used AFTER authMiddleware
 * 
 * Usage:
 * router.post('/admin/churches', authMiddleware, requireRole(['SuperAdmin']), createChurch);
 */

export const requireRole = (allowedRoles: string[]) => {
  return (req, res, next) => {
    // Check if user is authenticated (authMiddleware should set req.account)
    if (!req.account) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.account.role)) {
      return res.status(403).json({
        message: "Access denied. Insufficient permissions.",
        required: allowedRoles,
        current: req.account.role,
      });
    }

    // User has required role, proceed
    next();
  };
};

/**
 * Convenience middleware for SuperAdmin only routes
 */
export const requireSuperAdmin = requireRole(["SuperAdmin"]);

/**
 * Convenience middleware for ChurchAdmin routes
 */
export const requireChurchAdmin = requireRole(["ChurchAdmin"]);

/**
 * Convenience middleware for Counselor routes
 */
export const requireCounselor = requireRole(["Counselor"]);

/**
 * Convenience middleware for routes accessible by admins (Super + Church)
 */
export const requireAnyAdmin = requireRole(["SuperAdmin", "ChurchAdmin"]);