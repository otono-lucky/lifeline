"use strict";
// services/counselorService.ts
// Counselor business logic
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
exports.getCounselors = exports.getCounselorsByChurch = exports.resolveCounsellorScope = exports.updateCounselor = exports.getCounselorById = exports.verifyUser = exports.getAssignedUsers = exports.getCounselorDashboard = void 0;
var db_1 = require("../config/db");
/**
 * Get counselor dashboard data
 */
var getCounselorDashboard = function (requesterAccountId, requestedCounsellorAccountId) { return __awaiter(void 0, void 0, void 0, function () {
    var counselorId, counselor, totalMatches, activeMatches, totalAssigned, pendingVetting, verifiedActive, rejected, debriefRequired;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.resolveCounsellorScope)(requesterAccountId, requestedCounsellorAccountId)];
            case 1:
                counselorId = _a.sent();
                return [4 /*yield*/, db_1.prisma.counselor.findUnique({
                        where: { id: counselorId },
                        include: {
                            account: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                },
                            },
                            assignedUsers: {
                                include: {
                                    account: {
                                        select: {
                                            firstName: true,
                                            lastName: true,
                                            email: true,
                                            createdAt: true,
                                        },
                                    },
                                },
                                orderBy: { account: { createdAt: "desc" } },
                            },
                        },
                    })];
            case 2:
                counselor = _a.sent();
                if (!counselor) {
                    throw new Error("Counselor profile not found");
                }
                return [4 /*yield*/, db_1.prisma.match.count({
                        where: { counselorId: counselor.id },
                    })];
            case 3:
                totalMatches = _a.sent();
                return [4 /*yield*/, db_1.prisma.match.count({
                        where: {
                            counselorId: counselor.id,
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
                    })];
            case 4:
                activeMatches = _a.sent();
                totalAssigned = counselor.assignedUsers.length;
                pendingVetting = counselor.assignedUsers.filter(function (u) { return u.vettingStatus === "PENDING_VETTING"; }).length;
                verifiedActive = counselor.assignedUsers.filter(function (u) { return u.vettingStatus === "VETTED_ACTIVE"; }).length;
                rejected = counselor.assignedUsers.filter(function (u) { return u.vettingStatus === "REJECTED"; }).length;
                debriefRequired = counselor.assignedUsers.filter(function (u) { return u.vettingStatus === "DEBRIEF_REQUIRED"; }).length;
                return [2 /*return*/, {
                        counselor: {
                            accountId: counselor.account.id,
                            firstName: counselor.account.firstName,
                            lastName: counselor.account.lastName,
                            name: "".concat(counselor.account.firstName, " ").concat(counselor.account.lastName),
                            email: counselor.account.email,
                        },
                        stats: {
                            totalAssigned: totalAssigned,
                            pendingVetting: pendingVetting,
                            verifiedActive: verifiedActive,
                            rejected: rejected,
                            debriefRequired: debriefRequired,
                            totalMatches: totalMatches,
                            activeMatches: activeMatches,
                        },
                        assignedUsers: counselor.assignedUsers.map(function (u) { return ({
                            accountId: u.accountId,
                            firstName: u.account.firstName,
                            lastName: u.account.lastName,
                            email: u.account.email,
                            vettingStatus: u.vettingStatus,
                            verificationNotes: u.verificationNotes,
                            verifiedAt: u.verifiedAt,
                            assignedAt: u.account.createdAt,
                        }); }),
                    }];
        }
    });
}); };
exports.getCounselorDashboard = getCounselorDashboard;
/**
 * Get assigned users with filters
 */
var getAssignedUsers = function (accountId, requestedCounsellorAccountId, filters) { return __awaiter(void 0, void 0, void 0, function () {
    var counselorId, page, limit, skip, where, _a, users, total;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, (0, exports.resolveCounsellorScope)(accountId, requestedCounsellorAccountId)];
            case 1:
                counselorId = _b.sent();
                page = (filters === null || filters === void 0 ? void 0 : filters.page) || 1;
                limit = (filters === null || filters === void 0 ? void 0 : filters.limit) || 20;
                skip = (page - 1) * limit;
                where = { assignedCounselorId: counselorId };
                if (filters === null || filters === void 0 ? void 0 : filters.vettingStatus) {
                    where.vettingStatus = filters.vettingStatus;
                }
                return [4 /*yield*/, Promise.all([
                        db_1.prisma.user.findMany({
                            where: where,
                            skip: skip,
                            take: limit,
                            orderBy: { account: { createdAt: "desc" } },
                            include: {
                                account: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
                                        email: true,
                                        phone: true,
                                        createdAt: true,
                                    },
                                },
                            },
                        }),
                        db_1.prisma.user.count({ where: where }),
                    ])];
            case 2:
                _a = _b.sent(), users = _a[0], total = _a[1];
                return [2 /*return*/, {
                        users: users.map(function (u) { return ({
                            accountId: u.accountId,
                            firstName: u.account.firstName,
                            lastName: u.account.lastName,
                            email: u.account.email,
                            phone: u.account.phone,
                            gender: u.gender,
                            vettingStatus: u.vettingStatus,
                            verificationNotes: u.verificationNotes,
                            verifiedAt: u.verifiedAt,
                            occupation: u.occupation,
                            residenceState: u.residenceState,
                            residenceCity: u.residenceCity,
                            assignedAt: u.account.createdAt,
                        }); }),
                        pagination: {
                            total: total,
                            page: page,
                            limit: limit,
                            totalPages: Math.ceil(total / limit),
                        },
                    }];
        }
    });
}); };
exports.getAssignedUsers = getAssignedUsers;
/**
 * Verify or reject user
 */
var verifyUser = function (counselorAccountId, userIdentifier, status, notes) { return __awaiter(void 0, void 0, void 0, function () {
    var counselor, user, isVerified, vettingStatus, updatedUser;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.counselor.findUnique({
                    where: { accountId: counselorAccountId },
                    select: { id: true },
                })];
            case 1:
                counselor = _a.sent();
                if (!counselor) {
                    throw new Error("Counselor profile not found");
                }
                return [4 /*yield*/, resolveUserByIdentifier(userIdentifier)];
            case 2:
                user = _a.sent();
                if (!user) {
                    throw new Error("User not found");
                }
                if (user.assignedCounselorId !== counselor.id) {
                    throw new Error("User is not assigned to you");
                }
                isVerified = status === "verified";
                vettingStatus = isVerified ? "VETTED_ACTIVE" : "REJECTED";
                return [4 /*yield*/, db_1.prisma.user.update({
                        where: { id: user.id },
                        data: {
                            vettingStatus: vettingStatus,
                            isVerified: isVerified,
                            isDiscoveryIndexed: isVerified,
                            verificationNotes: notes,
                            verifiedAt: isVerified ? new Date() : null,
                        },
                        include: {
                            account: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                },
                            },
                        },
                    })];
            case 3:
                updatedUser = _a.sent();
                return [2 /*return*/, {
                        accountId: updatedUser.accountId,
                        userName: "".concat(updatedUser.account.firstName, " ").concat(updatedUser.account.lastName),
                        email: updatedUser.account.email,
                        vettingStatus: updatedUser.vettingStatus,
                        verifiedAt: updatedUser.verifiedAt,
                    }];
        }
    });
}); };
exports.verifyUser = verifyUser;
/**
 * Get single counselor by account ID
 */
var getCounselorById = function (counselorAccountId) { return __awaiter(void 0, void 0, void 0, function () {
    var counselor;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.counselor.findUnique({
                    where: { accountId: counselorAccountId },
                    include: {
                        account: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                phone: true,
                                status: true,
                            },
                        },
                        church: {
                            select: {
                                id: true,
                                officialName: true,
                                aka: true,
                            },
                        },
                    },
                })];
            case 1:
                counselor = _a.sent();
                if (!counselor) {
                    throw new Error("Counselor not found");
                }
                return [2 /*return*/, {
                        accountId: counselor.account.id,
                        firstName: counselor.account.firstName,
                        lastName: counselor.account.lastName,
                        email: counselor.account.email,
                        phone: counselor.account.phone,
                        accountStatus: counselor.account.status,
                        bio: counselor.bio,
                        church: counselor.church,
                    }];
        }
    });
}); };
exports.getCounselorById = getCounselorById;
/**
 * Update counselor details
 */
var updateCounselor = function (counselorAccountId, data) { return __awaiter(void 0, void 0, void 0, function () {
    var counselor;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.counselor.update({
                    where: { accountId: counselorAccountId },
                    data: {
                        bio: data.bio,
                    },
                    include: {
                        account: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                phone: true,
                                status: true,
                            },
                        },
                    },
                })];
            case 1:
                counselor = _a.sent();
                return [2 /*return*/, {
                        accountId: counselor.account.id,
                        firstName: counselor.account.firstName,
                        lastName: counselor.account.lastName,
                        email: counselor.account.email,
                        phone: counselor.account.phone,
                        accountStatus: counselor.account.status,
                        bio: counselor.bio,
                    }];
        }
    });
}); };
exports.updateCounselor = updateCounselor;
var resolveCounsellorScope = function (requesterId, requestedCounsellorAccountId) { return __awaiter(void 0, void 0, void 0, function () {
    var requester, counselor, counselor, ownId, requestedCounselor;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.account.findUnique({
                    where: { id: requesterId },
                    include: { counselor: true, churchAdmin: true, superAdmin: true },
                })];
            case 1:
                requester = _a.sent();
                if (!requester)
                    throw new Error("Requester not found");
                if (!requester.superAdmin) return [3 /*break*/, 3];
                if (!requestedCounsellorAccountId) {
                    throw new Error("Super admin must provide counselor accountId");
                }
                return [4 /*yield*/, db_1.prisma.counselor.findUnique({
                        where: { accountId: requestedCounsellorAccountId },
                        select: { id: true },
                    })];
            case 2:
                counselor = _a.sent();
                if (!counselor) {
                    throw new Error("Counselor not found");
                }
                return [2 /*return*/, counselor.id];
            case 3:
                if (!requester.churchAdmin) return [3 /*break*/, 5];
                if (!requestedCounsellorAccountId) {
                    throw new Error("Church admin must provide counselor accountId");
                }
                return [4 /*yield*/, db_1.prisma.counselor.findUnique({
                        where: { accountId: requestedCounsellorAccountId },
                        select: { id: true, churchId: true },
                    })];
            case 4:
                counselor = _a.sent();
                if (!counselor || counselor.churchId !== requester.churchAdmin.churchId) {
                    throw new Error("Church admin can only view counselors in their church");
                }
                return [2 /*return*/, counselor.id];
            case 5:
                if (!requester.counselor) return [3 /*break*/, 8];
                ownId = requester.counselor.id;
                if (!requestedCounsellorAccountId) return [3 /*break*/, 7];
                return [4 /*yield*/, db_1.prisma.counselor.findUnique({
                        where: { accountId: requestedCounsellorAccountId },
                        select: { id: true },
                    })];
            case 6:
                requestedCounselor = _a.sent();
                if (!requestedCounselor || requestedCounselor.id !== ownId) {
                    throw new Error("Counselor can only view their own data");
                }
                _a.label = 7;
            case 7: return [2 /*return*/, ownId];
            case 8: throw new Error("Unauthorized role");
        }
    });
}); };
exports.resolveCounsellorScope = resolveCounsellorScope;
var resolveUserByIdentifier = function (userIdentifier) { return __awaiter(void 0, void 0, void 0, function () {
    var userByAccount;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.user.findUnique({
                    where: { accountId: userIdentifier },
                    select: { id: true, accountId: true, assignedCounselorId: true },
                })];
            case 1:
                userByAccount = _a.sent();
                if (!userByAccount) {
                    throw new Error("User not found");
                }
                return [2 /*return*/, userByAccount];
        }
    });
}); };
/**
 * Get counselors by church
 */
var getCounselorsByChurch = function (churchId) { return __awaiter(void 0, void 0, void 0, function () {
    var rows;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.counselor.findMany({
                    where: { churchId: churchId },
                    include: {
                        account: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                phone: true,
                                status: true,
                                createdAt: true,
                            },
                        },
                        church: {
                            select: {
                                id: true,
                                officialName: true,
                                aka: true,
                                email: true,
                                phone: true,
                                status: true,
                            },
                        },
                    },
                    orderBy: { account: { createdAt: "desc" } },
                })];
            case 1:
                rows = _a.sent();
                return [2 /*return*/, rows.map(function (c) { return ({
                        accountId: c.account.id,
                        firstName: c.account.firstName,
                        lastName: c.account.lastName,
                        email: c.account.email,
                        phone: c.account.phone,
                        accountStatus: c.account.status,
                        createdAt: c.account.createdAt,
                        bio: c.bio,
                        church: c.church,
                    }); })];
        }
    });
}); };
exports.getCounselorsByChurch = getCounselorsByChurch;
var getCounselors = function (filter) { return __awaiter(void 0, void 0, void 0, function () {
    var status, page, limit, rows;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                status = filter.status;
                page = (_a = filter.page) !== null && _a !== void 0 ? _a : 1;
                limit = (_b = filter.limit) !== null && _b !== void 0 ? _b : 10;
                return [4 /*yield*/, db_1.prisma.counselor.findMany({
                        where: {
                            account: __assign({}, (status && { status: status })),
                        },
                        skip: (page - 1) * limit,
                        take: limit,
                        include: {
                            account: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    phone: true,
                                    status: true,
                                    createdAt: true,
                                },
                            },
                            church: {
                                select: {
                                    id: true,
                                    officialName: true,
                                    aka: true,
                                    email: true,
                                    phone: true,
                                    status: true,
                                },
                            },
                        },
                        orderBy: { account: { createdAt: "desc" } },
                    })];
            case 1:
                rows = _c.sent();
                return [2 /*return*/, rows.map(function (c) { return ({
                        accountId: c.account.id,
                        firstName: c.account.firstName,
                        lastName: c.account.lastName,
                        email: c.account.email,
                        phone: c.account.phone,
                        accountStatus: c.account.status,
                        createdAt: c.account.createdAt,
                        bio: c.bio,
                        church: c.church,
                    }); })];
        }
    });
}); };
exports.getCounselors = getCounselors;
