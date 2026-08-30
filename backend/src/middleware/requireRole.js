"use strict";
// middleware/requireRole.ts
// Role-based access control middleware
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAnyAdmin = exports.requireCounselor = exports.requireChurchAdmin = exports.requireSuperAdmin = exports.requireRole = void 0;
/**
 * Middleware to check if user has required role
 * Must be used AFTER authMiddleware
 */
var requireRole = function (allowedRoles) {
    return function (req, res, next) {
        if (!req.account) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
                data: null,
                errors: null,
            });
        }
        if (!allowedRoles.includes(req.account.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Insufficient permissions.",
                data: null,
                errors: {
                    required: allowedRoles,
                    current: req.account.role,
                },
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
exports.requireSuperAdmin = (0, exports.requireRole)(["SuperAdmin"]);
exports.requireChurchAdmin = (0, exports.requireRole)(["ChurchAdmin"]);
exports.requireCounselor = (0, exports.requireRole)(["Counselor"]);
exports.requireAnyAdmin = (0, exports.requireRole)(["SuperAdmin", "ChurchAdmin"]);
exports.default = exports.requireRole;
