"use strict";
// services/churchService.ts
// Church resource management
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
exports.resolveChurchScope = exports.activateChurch = exports.updateChurchStatus = exports.updateChurch = exports.getChurchMembers = exports.getChurchById = exports.getPublicChurches = exports.getChurches = exports.createChurch = void 0;
var db_1 = require("../config/db");
/**
 * Create a new church
 */
var createChurch = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var existingChurch, church;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.church.findUnique({
                    where: { email: data.email },
                })];
            case 1:
                existingChurch = _a.sent();
                if (existingChurch) {
                    throw new Error("Church with this email already exists");
                }
                return [4 /*yield*/, db_1.prisma.church.create({
                        data: {
                            officialName: data.officialName,
                            aka: data.aka,
                            churchModel: data.churchModel || "INDIVIDUAL_PARISH",
                            email: data.email,
                            phone: data.phone,
                            state: data.state,
                            lga: data.lga,
                            city: data.city,
                            address: data.address,
                            status: "pending",
                            createdBy: data.createdBy,
                        },
                    })];
            case 2:
                church = _a.sent();
                return [2 /*return*/, church];
        }
    });
}); };
exports.createChurch = createChurch;
/**
 * Get all churches
 */
var getChurches = function (filters) { return __awaiter(void 0, void 0, void 0, function () {
    var page, limit, skip, where, _a, churches, total;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                page = (filters === null || filters === void 0 ? void 0 : filters.page) || 1;
                limit = (filters === null || filters === void 0 ? void 0 : filters.limit) || 20;
                skip = (page - 1) * limit;
                where = {};
                if (filters === null || filters === void 0 ? void 0 : filters.status)
                    where.status = filters.status;
                if (filters === null || filters === void 0 ? void 0 : filters.churchModel)
                    where.churchModel = filters.churchModel;
                return [4 /*yield*/, Promise.all([
                        db_1.prisma.church.findMany({
                            where: where,
                            skip: skip,
                            take: limit,
                            orderBy: { createdAt: "desc" },
                            include: {
                                churchAdmin: {
                                    include: {
                                        account: {
                                            select: {
                                                id: true,
                                                firstName: true,
                                                lastName: true,
                                                email: true,
                                                status: true,
                                            },
                                        },
                                    },
                                },
                                counselors: {
                                    select: {
                                        id: true,
                                        account: {
                                            select: {
                                                firstName: true,
                                                lastName: true,
                                                email: true,
                                                status: true,
                                            },
                                        },
                                    },
                                },
                            },
                        }),
                        db_1.prisma.church.count({ where: where }),
                    ])];
            case 1:
                _a = _b.sent(), churches = _a[0], total = _a[1];
                return [2 /*return*/, {
                        churches: churches,
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
exports.getChurches = getChurches;
/**
 * Get public list of active churches with minimal fields for signup
 */
var getPublicChurches = function (options) { return __awaiter(void 0, void 0, void 0, function () {
    var limit, churches;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                limit = (options === null || options === void 0 ? void 0 : options.limit) || 200;
                return [4 /*yield*/, db_1.prisma.church.findMany({
                        where: { status: "active" },
                        take: limit,
                        orderBy: { officialName: "asc" },
                        select: {
                            id: true,
                            officialName: true,
                            aka: true,
                            churchModel: true,
                            state: true,
                            lga: true,
                            city: true,
                            address: true,
                        },
                    })];
            case 1:
                churches = _a.sent();
                return [2 /*return*/, churches.map(function (c) { return ({
                        id: c.id,
                        officialName: c.officialName,
                        aka: c.aka,
                        churchModel: c.churchModel,
                        address: {
                            state: c.state,
                            lga: c.lga,
                            city: c.city,
                            address: c.address,
                        },
                    }); })];
        }
    });
}); };
exports.getPublicChurches = getPublicChurches;
/**
 * Get single church by ID
 */
var getChurchById = function (churchId) { return __awaiter(void 0, void 0, void 0, function () {
    var church;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.church.findUnique({
                    where: { id: churchId },
                    include: {
                        churchAdmin: {
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
                            },
                        },
                        counselors: {
                            include: {
                                account: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        email: true,
                                        status: true,
                                    },
                                },
                            },
                        },
                    },
                })];
            case 1:
                church = _a.sent();
                if (!church) {
                    throw new Error("Church not found");
                }
                return [2 /*return*/, church];
        }
    });
}); };
exports.getChurchById = getChurchById;
/**
 * Get all members of a church with Privacy Firewall for Church Admin
 */
var getChurchMembers = function (requesterId, options) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, churchId, vettingStatus, _b, page, _c, limit, skip, targetChurchId, where, _d, members, total;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _a = options || {}, churchId = _a.churchId, vettingStatus = _a.vettingStatus, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 20 : _c;
                skip = (page - 1) * limit;
                return [4 /*yield*/, (0, exports.resolveChurchScope)(requesterId, churchId)];
            case 1:
                targetChurchId = _e.sent();
                where = { churchId: targetChurchId };
                if (vettingStatus) {
                    where.vettingStatus = vettingStatus;
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
                                        status: true,
                                        createdAt: true,
                                    },
                                },
                                assignedCounselor: {
                                    select: {
                                        id: true,
                                        account: {
                                            select: {
                                                id: true,
                                                firstName: true,
                                                lastName: true,
                                            },
                                        },
                                    },
                                },
                                photos: {
                                    where: { order: 1 },
                                    select: { url: true },
                                },
                            },
                        }),
                        db_1.prisma.user.count({ where: where }),
                    ])];
            case 2:
                _d = _e.sent(), members = _d[0], total = _d[1];
                return [2 /*return*/, {
                        members: members.map(function (m) {
                            var _a;
                            return ({
                                accountId: m.accountId,
                                firstName: m.account.firstName,
                                lastName: m.account.lastName,
                                email: m.account.email,
                                phone: m.account.phone,
                                gender: m.gender,
                                vettingStatus: m.vettingStatus,
                                isVerified: m.isVerified,
                                photoUrl: ((_a = m.photos[0]) === null || _a === void 0 ? void 0 : _a.url) || m.profilePictureUrl || null,
                                branchName: m.branchName,
                                assignedCounselor: m.assignedCounselor
                                    ? {
                                        accountId: m.assignedCounselor.account.id,
                                        name: "".concat(m.assignedCounselor.account.firstName, " ").concat(m.assignedCounselor.account.lastName),
                                    }
                                    : null,
                                accountStatus: m.account.status,
                                joinedAt: m.account.createdAt,
                            });
                        }),
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
exports.getChurchMembers = getChurchMembers;
/**
 * Update church details
 */
var updateChurch = function (churchId, data) { return __awaiter(void 0, void 0, void 0, function () {
    var church;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.church.update({
                    where: { id: churchId },
                    data: {
                        officialName: data.officialName,
                        aka: data.aka,
                        churchModel: data.churchModel,
                        phone: data.phone,
                        state: data.state,
                        lga: data.lga,
                        city: data.city,
                        address: data.address,
                    },
                })];
            case 1:
                church = _a.sent();
                return [2 /*return*/, church];
        }
    });
}); };
exports.updateChurch = updateChurch;
var updateChurchStatus = function (churchId, status) { return __awaiter(void 0, void 0, void 0, function () {
    var church;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.church.update({
                    where: { id: churchId },
                    data: {
                        status: status,
                    },
                })];
            case 1:
                church = _a.sent();
                return [2 /*return*/, church];
        }
    });
}); };
exports.updateChurchStatus = updateChurchStatus;
var activateChurch = function (churchId) { return __awaiter(void 0, void 0, void 0, function () {
    var church;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.church.update({
                    where: { id: churchId },
                    data: { status: "active" },
                })];
            case 1:
                church = _a.sent();
                return [2 /*return*/, church];
        }
    });
}); };
exports.activateChurch = activateChurch;
var resolveChurchScope = function (requesterId, requestedChurchId) { return __awaiter(void 0, void 0, void 0, function () {
    var requester, ownChurchId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.account.findUnique({
                    where: { id: requesterId },
                    include: { churchAdmin: true, superAdmin: true },
                })];
            case 1:
                requester = _a.sent();
                if (!requester)
                    throw new Error("Requester not found");
                if (requester.superAdmin) {
                    if (!requestedChurchId) {
                        throw new Error("Super admin must provide a churchId");
                    }
                    return [2 /*return*/, requestedChurchId];
                }
                if (requester.churchAdmin) {
                    ownChurchId = requester.churchAdmin.churchId;
                    if (requestedChurchId && requestedChurchId !== ownChurchId) {
                        throw new Error("Church admin can only view their own church");
                    }
                    return [2 /*return*/, ownChurchId];
                }
                throw new Error("Unauthorized role for church-scoped data");
        }
    });
}); };
exports.resolveChurchScope = resolveChurchScope;
