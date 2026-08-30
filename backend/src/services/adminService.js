"use strict";
// services/adminService.ts
// SuperAdmin dashboard aggregated stats
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlatformStats = exports.getSuperAdminDashboard = void 0;
var db_1 = require("../config/db");
var ageUtils_1 = require("../utils/ageUtils");
/**
 * Get SuperAdmin dashboard statistics
 */
var getSuperAdminDashboard = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, totalChurches, activeChurches, pendingChurches, totalChurchAdmins, totalCounselors, activeCounselors, totalUsers, verifiedUsers, premiumUsers, totalMatches, activeMatches, recentChurches, recentUsers;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, Promise.all([
                    // Church stats
                    db_1.prisma.church.count(),
                    db_1.prisma.church.count({ where: { status: "active" } }),
                    db_1.prisma.church.count({ where: { status: "pending" } }),
                    // Admin stats
                    db_1.prisma.churchAdmin.count(),
                    // Counselor stats
                    db_1.prisma.counselor.count(),
                    db_1.prisma.account.count({
                        where: { role: "Counselor", status: "active" },
                    }),
                    // User stats
                    db_1.prisma.user.count(),
                    db_1.prisma.user.count({ where: { isVerified: true } }),
                    db_1.prisma.user.count({ where: { subscriptionTier: "premium" } }),
                    // Match stats
                    db_1.prisma.match.count(),
                    db_1.prisma.match.count({
                        where: {
                            status: {
                                in: [
                                    "AWAITING_DECISIONS",
                                    "WAITING_FOR_OTHER",
                                    "MUTUAL_ACCEPTED",
                                    "IN_CONVERSATION",
                                    "COURTSHIP",
                                ],
                            },
                        },
                    }),
                    // Recent activity
                    db_1.prisma.church.findMany({
                        take: 5,
                        orderBy: { createdAt: "desc" },
                        select: {
                            id: true,
                            officialName: true,
                            aka: true,
                            churchModel: true,
                            status: true,
                            createdAt: true,
                        },
                    }),
                    db_1.prisma.user.findMany({
                        take: 5,
                        orderBy: { account: { createdAt: "desc" } },
                        select: {
                            accountId: true,
                            gender: true,
                            dateOfBirth: true,
                            isVerified: true,
                            vettingStatus: true,
                            account: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    createdAt: true,
                                },
                            },
                        },
                    }),
                ])];
            case 1:
                _a = _b.sent(), totalChurches = _a[0], activeChurches = _a[1], pendingChurches = _a[2], totalChurchAdmins = _a[3], totalCounselors = _a[4], activeCounselors = _a[5], totalUsers = _a[6], verifiedUsers = _a[7], premiumUsers = _a[8], totalMatches = _a[9], activeMatches = _a[10], recentChurches = _a[11], recentUsers = _a[12];
                return [2 /*return*/, {
                        overview: {
                            churches: {
                                total: totalChurches,
                                active: activeChurches,
                                pending: pendingChurches,
                            },
                            churchAdmins: {
                                total: totalChurchAdmins,
                            },
                            counselors: {
                                total: totalCounselors,
                                active: activeCounselors,
                            },
                            users: {
                                total: totalUsers,
                                verified: verifiedUsers,
                                premium: premiumUsers,
                                free: totalUsers - premiumUsers,
                            },
                            matches: {
                                total: totalMatches,
                                active: activeMatches,
                            },
                        },
                        recentActivity: {
                            churches: recentChurches,
                            users: recentUsers.map(function (user) { return (__assign(__assign({}, user), { age: (0, ageUtils_1.calculateAge)(user.dateOfBirth) })); }),
                        },
                    }];
        }
    });
}); };
exports.getSuperAdminDashboard = getSuperAdminDashboard;
/**
 * Get platform-wide statistics
 */
var getPlatformStats = function (period) { return __awaiter(void 0, void 0, void 0, function () {
    var now, startDate, _a, newUsers, newChurches, newMatches;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                now = new Date();
                switch (period) {
                    case "day":
                        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                        break;
                    case "week":
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case "month":
                        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        break;
                    default:
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                }
                return [4 /*yield*/, Promise.all([
                        db_1.prisma.account.count({
                            where: {
                                role: "User",
                                createdAt: { gte: startDate },
                            },
                        }),
                        db_1.prisma.church.count({
                            where: {
                                createdAt: { gte: startDate },
                            },
                        }),
                        db_1.prisma.match.count({
                            where: {
                                createdAt: { gte: startDate },
                            },
                        }),
                    ])];
            case 1:
                _a = _b.sent(), newUsers = _a[0], newChurches = _a[1], newMatches = _a[2];
                return [2 /*return*/, {
                        period: period || "week",
                        startDate: startDate,
                        endDate: now,
                        stats: {
                            newUsers: newUsers,
                            newChurches: newChurches,
                            newMatches: newMatches,
                        },
                    }];
        }
    });
}); };
exports.getPlatformStats = getPlatformStats;
