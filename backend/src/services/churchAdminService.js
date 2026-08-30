"use strict";
// services/churchAdminService.ts
// ChurchAdmin & Pastoral Governance business logic
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
exports.resolveChurchAdminScope = exports.updateChurchAdmin = exports.getChurchAdminById = exports.getChurchAdmins = exports.assignUserToCounselor = exports.getChurchAdminDashboard = void 0;
var db_1 = require("../config/db");
/**
 * Get church admin dashboard data
 */
var getChurchAdminDashboard = function (requesterAccountId, requestedChurchAdminAccountId) { return __awaiter(void 0, void 0, void 0, function () {
    var scope, churchAdmin, totalMatches, activeMatches, totalMembers, verifiedMembers, pendingVerification, draftMembers, rejectedMembers, totalCounselors, recentMembers;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.resolveChurchAdminScope)(requesterAccountId, requestedChurchAdminAccountId)];
            case 1:
                scope = _a.sent();
                return [4 /*yield*/, db_1.prisma.churchAdmin.findUnique({
                        where: { accountId: scope.accountId },
                        include: {
                            account: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    phone: true,
                                },
                            },
                            church: {
                                include: {
                                    members: {
                                        select: {
                                            id: true,
                                            vettingStatus: true,
                                        },
                                    },
                                    counselors: {
                                        select: {
                                            id: true,
                                        },
                                    },
                                },
                            },
                        },
                    })];
            case 2:
                churchAdmin = _a.sent();
                if (!churchAdmin) {
                    throw new Error("Church admin profile not found");
                }
                return [4 /*yield*/, db_1.prisma.match.count({
                        where: {
                            participants: {
                                some: {
                                    user: {
                                        churchId: churchAdmin.churchId,
                                    },
                                },
                            },
                        },
                    })];
            case 3:
                totalMatches = _a.sent();
                return [4 /*yield*/, db_1.prisma.match.count({
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
                            participants: {
                                some: {
                                    user: {
                                        churchId: churchAdmin.churchId,
                                    },
                                },
                            },
                        },
                    })];
            case 4:
                activeMatches = _a.sent();
                totalMembers = churchAdmin.church.members.length;
                verifiedMembers = churchAdmin.church.members.filter(function (m) { return m.vettingStatus === "VETTED_ACTIVE"; }).length;
                pendingVerification = churchAdmin.church.members.filter(function (m) { return m.vettingStatus === "PENDING_VETTING"; }).length;
                draftMembers = churchAdmin.church.members.filter(function (m) { return m.vettingStatus === "DRAFT"; }).length;
                rejectedMembers = churchAdmin.church.members.filter(function (m) { return m.vettingStatus === "REJECTED"; }).length;
                totalCounselors = churchAdmin.church.counselors.length;
                return [4 /*yield*/, db_1.prisma.user.findMany({
                        where: { churchId: churchAdmin.churchId },
                        take: 5,
                        orderBy: { account: { createdAt: "desc" } },
                        include: {
                            account: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    createdAt: true,
                                },
                            },
                            assignedCounselor: {
                                select: {
                                    id: true,
                                    account: {
                                        select: {
                                            firstName: true,
                                            lastName: true,
                                        },
                                    },
                                },
                            },
                        },
                    })];
            case 5:
                recentMembers = _a.sent();
                return [2 /*return*/, {
                        admin: {
                            title: churchAdmin.title,
                            name: "".concat(churchAdmin.account.firstName, " ").concat(churchAdmin.account.lastName),
                            email: churchAdmin.account.email,
                        },
                        church: {
                            id: churchAdmin.church.id,
                            name: churchAdmin.church.officialName,
                            aka: churchAdmin.church.aka,
                            churchModel: churchAdmin.church.churchModel,
                            email: churchAdmin.church.email,
                            phone: churchAdmin.church.phone,
                            status: churchAdmin.church.status,
                        },
                        stats: {
                            totalMembers: totalMembers,
                            verifiedMembers: verifiedMembers,
                            pendingVerification: pendingVerification,
                            draftMembers: draftMembers,
                            rejectedMembers: rejectedMembers,
                            totalCounselors: totalCounselors,
                            totalMatches: totalMatches,
                            activeMatches: activeMatches,
                        },
                        recentMembers: recentMembers.map(function (m) { return ({
                            accountId: m.accountId,
                            firstName: m.account.firstName,
                            lastName: m.account.lastName,
                            email: m.account.email,
                            vettingStatus: m.vettingStatus,
                            assignedCounselor: m.assignedCounselor
                                ? "".concat(m.assignedCounselor.account.firstName, " ").concat(m.assignedCounselor.account.lastName)
                                : null,
                            joinedAt: m.account.createdAt,
                        }); }),
                    }];
        }
    });
}); };
exports.getChurchAdminDashboard = getChurchAdminDashboard;
/**
 * Assign user to counselor
 */
var assignUserToCounselor = function (churchAdminAccountId, userAccountId, counselorAccountId) { return __awaiter(void 0, void 0, void 0, function () {
    var churchAdmin, user, counselor, updatedUser;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.churchAdmin.findUnique({
                    where: { accountId: churchAdminAccountId },
                    select: { churchId: true },
                })];
            case 1:
                churchAdmin = _a.sent();
                if (!churchAdmin) {
                    throw new Error("Church admin profile not found");
                }
                return [4 /*yield*/, db_1.prisma.user.findUnique({
                        where: { accountId: userAccountId },
                        select: { id: true, accountId: true, churchId: true },
                    })];
            case 2:
                user = _a.sent();
                if (!user || user.churchId !== churchAdmin.churchId) {
                    throw new Error("User does not belong to your church");
                }
                return [4 /*yield*/, db_1.prisma.counselor.findUnique({
                        where: { accountId: counselorAccountId },
                        select: { id: true, accountId: true, churchId: true },
                    })];
            case 3:
                counselor = _a.sent();
                if (!counselor || counselor.churchId !== churchAdmin.churchId) {
                    throw new Error("Counselor does not belong to your church");
                }
                return [4 /*yield*/, db_1.prisma.user.update({
                        where: { id: user.id },
                        data: {
                            assignedCounselorId: counselor.id,
                        },
                        include: {
                            account: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                            assignedCounselor: {
                                select: {
                                    account: {
                                        select: {
                                            firstName: true,
                                            lastName: true,
                                        },
                                    },
                                },
                            },
                        },
                    })];
            case 4:
                updatedUser = _a.sent();
                return [2 /*return*/, {
                        userAccountId: updatedUser.accountId,
                        userName: "".concat(updatedUser.account.firstName, " ").concat(updatedUser.account.lastName),
                        counselorAccountId: counselor.accountId,
                        counselorName: "".concat(updatedUser.assignedCounselor.account.firstName, " ").concat(updatedUser.assignedCounselor.account.lastName),
                        vettingStatus: updatedUser.vettingStatus,
                    }];
        }
    });
}); };
exports.assignUserToCounselor = assignUserToCounselor;
/**
 * List church admins with filters
 */
var getChurchAdmins = function (filters) { return __awaiter(void 0, void 0, void 0, function () {
    var page, limit, skip, where, _a, rows, total;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                page = (filters === null || filters === void 0 ? void 0 : filters.page) || 1;
                limit = (filters === null || filters === void 0 ? void 0 : filters.limit) || 20;
                skip = (page - 1) * limit;
                where = {};
                if (filters === null || filters === void 0 ? void 0 : filters.churchId) {
                    where.churchId = filters.churchId;
                }
                if (filters === null || filters === void 0 ? void 0 : filters.status) {
                    where.account = { status: filters.status };
                }
                return [4 /*yield*/, Promise.all([
                        db_1.prisma.churchAdmin.findMany({
                            where: where,
                            skip: skip,
                            take: limit,
                            orderBy: { account: { createdAt: "desc" } },
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
                                        churchModel: true,
                                        email: true,
                                        phone: true,
                                        status: true,
                                    },
                                },
                            },
                        }),
                        db_1.prisma.churchAdmin.count({ where: where }),
                    ])];
            case 1:
                _a = _b.sent(), rows = _a[0], total = _a[1];
                return [2 /*return*/, {
                        churchAdmins: rows.map(function (r) { return ({
                            accountId: r.account.id,
                            title: r.title,
                            firstName: r.account.firstName,
                            lastName: r.account.lastName,
                            email: r.account.email,
                            phone: r.account.phone,
                            accountStatus: r.account.status,
                            createdAt: r.account.createdAt,
                            church: r.church,
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
exports.getChurchAdmins = getChurchAdmins;
/**
 * Get single church admin by ID
 */
var getChurchAdminById = function (churchAdminAccountId) { return __awaiter(void 0, void 0, void 0, function () {
    var churchAdmin;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.churchAdmin.findUnique({
                    where: { accountId: churchAdminAccountId },
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
                                churchModel: true,
                                email: true,
                                phone: true,
                                status: true,
                            },
                        },
                    },
                })];
            case 1:
                churchAdmin = _a.sent();
                if (!churchAdmin) {
                    throw new Error("Church admin not found");
                }
                return [2 /*return*/, {
                        accountId: churchAdmin.account.id,
                        title: churchAdmin.title,
                        firstName: churchAdmin.account.firstName,
                        lastName: churchAdmin.account.lastName,
                        email: churchAdmin.account.email,
                        phone: churchAdmin.account.phone,
                        accountStatus: churchAdmin.account.status,
                        createdAt: churchAdmin.account.createdAt,
                        church: churchAdmin.church,
                    }];
        }
    });
}); };
exports.getChurchAdminById = getChurchAdminById;
/**
 * Update ChurchAdmin title or profile
 */
var updateChurchAdmin = function (churchAdminAccountId, data) { return __awaiter(void 0, void 0, void 0, function () {
    var churchAdmin;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, db_1.prisma.churchAdmin.update({
                    where: { accountId: churchAdminAccountId },
                    data: {
                        title: data.title !== undefined ? (_a = data.title) === null || _a === void 0 ? void 0 : _a.trim() : undefined,
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
            case 1:
                churchAdmin = _b.sent();
                return [2 /*return*/, {
                        accountId: churchAdmin.accountId,
                        title: churchAdmin.title,
                        name: "".concat(churchAdmin.account.firstName, " ").concat(churchAdmin.account.lastName),
                        email: churchAdmin.account.email,
                    }];
        }
    });
}); };
exports.updateChurchAdmin = updateChurchAdmin;
var resolveChurchAdminScope = function (requesterAccountId, requestedChurchAdminAccountId) { return __awaiter(void 0, void 0, void 0, function () {
    var requester, target;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.account.findUnique({
                    where: { id: requesterAccountId },
                    include: {
                        superAdmin: true,
                        churchAdmin: true,
                    },
                })];
            case 1:
                requester = _a.sent();
                if (!requester) {
                    throw new Error("Requester not found");
                }
                if (!requester.superAdmin) return [3 /*break*/, 3];
                if (!requestedChurchAdminAccountId) {
                    throw new Error("Super admin must provide church admin accountId");
                }
                return [4 /*yield*/, db_1.prisma.churchAdmin.findUnique({
                        where: { accountId: requestedChurchAdminAccountId },
                        select: { id: true, accountId: true, churchId: true },
                    })];
            case 2:
                target = _a.sent();
                if (!target) {
                    throw new Error("Church admin not found");
                }
                return [2 /*return*/, target];
            case 3:
                if (requester.churchAdmin) {
                    if (requestedChurchAdminAccountId &&
                        requestedChurchAdminAccountId !== requesterAccountId) {
                        throw new Error("Church admin can only view their own dashboard");
                    }
                    return [2 /*return*/, {
                            id: requester.churchAdmin.id,
                            accountId: requesterAccountId,
                            churchId: requester.churchAdmin.churchId,
                        }];
                }
                throw new Error("Unauthorized role");
        }
    });
}); };
exports.resolveChurchAdminScope = resolveChurchAdminScope;
