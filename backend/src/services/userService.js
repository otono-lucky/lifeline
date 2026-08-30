"use strict";
// services/userService.ts
// User business logic & privacy filtering
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserSocialMedia = exports.createUserSocialMedia = exports.listUserSocialMedia = exports.saveUserPhoto = exports.updateUser = exports.getUserById = exports.getUsers = exports.SOCIAL_PLATFORM_OPTIONS = void 0;
var db_1 = require("../config/db");
var ageUtils_1 = require("../utils/ageUtils");
var profileCompletion_1 = require("../utils/profileCompletion");
var constants_1 = require("../constants");
Object.defineProperty(exports, "SOCIAL_PLATFORM_OPTIONS", { enumerable: true, get: function () { return constants_1.SOCIAL_PLATFORM_OPTIONS; } });
/**
 * Get all users with role-aware privacy serialization
 */
var getUsers = function (requesterRole, requesterAccountId, filters) { return __awaiter(void 0, void 0, void 0, function () {
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
                if ((filters === null || filters === void 0 ? void 0 : filters.isVerified) !== undefined) {
                    where.isVerified = filters.isVerified;
                }
                if (filters === null || filters === void 0 ? void 0 : filters.vettingStatus) {
                    where.vettingStatus = filters.vettingStatus;
                }
                if (filters === null || filters === void 0 ? void 0 : filters.subscriptionTier) {
                    where.subscriptionTier = filters.subscriptionTier;
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
                                    orderBy: { order: "asc" },
                                    select: { url: true, order: true },
                                },
                            },
                        }),
                        db_1.prisma.user.count({ where: where }),
                    ])];
            case 1:
                _a = _b.sent(), rows = _a[0], total = _a[1];
                return [2 /*return*/, {
                        users: rows.map(function (u) {
                            var _a;
                            // Privacy firewall for Church Admin: mask sensitive financial & location data
                            var isPrivileged = requesterRole === "SuperAdmin";
                            return {
                                accountId: u.account.id,
                                firstName: u.account.firstName,
                                lastName: u.account.lastName,
                                email: u.account.email,
                                phone: u.account.phone,
                                accountStatus: u.account.status,
                                createdAt: u.account.createdAt,
                                vettingStatus: u.vettingStatus,
                                profileCompletionPercentage: u.profileCompletionPercentage,
                                isVerified: u.isVerified,
                                gender: u.gender,
                                age: (0, ageUtils_1.calculateAge)(u.dateOfBirth),
                                profilePictureUrl: u.profilePictureUrl || ((_a = u.photos[0]) === null || _a === void 0 ? void 0 : _a.url) || null,
                                photos: u.photos.map(function (p) { return p.url; }),
                                church: u.church,
                                branchName: u.branchName,
                                assignedCounselor: u.assignedCounselor
                                    ? {
                                        accountId: u.assignedCounselor.account.id,
                                        firstName: u.assignedCounselor.account.firstName,
                                        lastName: u.assignedCounselor.account.lastName,
                                    }
                                    : null,
                                // Privacy firewall
                                salaryRange: isPrivileged ? u.salaryRange : undefined,
                                residenceAddress: isPrivileged ? u.residenceAddress : undefined,
                            };
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
exports.getUsers = getUsers;
/**
 * Get single user by account ID with privacy firewall
 */
var getUserById = function (targetAccountId, requesterAccountId, requesterRole) { return __awaiter(void 0, void 0, void 0, function () {
    var row, isSelf, isSuperAdmin, isAssignedCounselor, completion, result;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, db_1.prisma.user.findUnique({
                    where: { accountId: targetAccountId },
                    include: {
                        account: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                phone: true,
                                status: true,
                                isEmailVerified: true,
                                createdAt: true,
                            },
                        },
                        church: {
                            select: {
                                id: true,
                                officialName: true,
                                aka: true,
                            },
                        },
                        assignedCounselor: {
                            select: {
                                id: true,
                                accountId: true,
                                account: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                        photos: {
                            orderBy: { order: "asc" },
                            select: { id: true, url: true, order: true },
                        },
                        socialMediaHandles: {
                            select: {
                                id: true,
                                platform: true,
                                handleOrUrl: true,
                                createdAt: true,
                            },
                            orderBy: { createdAt: "desc" },
                        },
                    },
                })];
            case 1:
                row = _c.sent();
                if (!row) {
                    throw new Error("User not found");
                }
                isSelf = targetAccountId === requesterAccountId;
                isSuperAdmin = requesterRole === "SuperAdmin";
                isAssignedCounselor = requesterRole === "Counselor" &&
                    ((_a = row.assignedCounselor) === null || _a === void 0 ? void 0 : _a.accountId) === requesterAccountId;
                completion = (0, profileCompletion_1.calculateProfileCompletion)(__assign(__assign({}, row), { photos: row.photos, socialMediaHandles: row.socialMediaHandles }));
                result = {
                    accountId: row.account.id,
                    userId: row.id,
                    firstName: row.account.firstName,
                    lastName: row.account.lastName,
                    email: isSelf || isSuperAdmin || isAssignedCounselor ? row.account.email : undefined,
                    phone: isSelf || isSuperAdmin || isAssignedCounselor ? row.account.phone : undefined,
                    whatsappNumber: isSelf || isSuperAdmin || isAssignedCounselor ? row.whatsappNumber : undefined,
                    accountStatus: row.account.status,
                    createdAt: row.account.createdAt,
                    isVerified: row.isVerified,
                    isEmailVerified: row.account.isEmailVerified,
                    vettingStatus: row.vettingStatus,
                    profileCompletionPercentage: completion.percentage,
                    missingFields: isSelf ? completion.missingFields : undefined,
                    verifiedAt: row.verifiedAt,
                    dateOfBirth: row.dateOfBirth,
                    age: (0, ageUtils_1.calculateAge)(row.dateOfBirth),
                    gender: row.gender,
                    subscriptionTier: row.subscriptionTier,
                    subscriptionStatus: row.subscriptionStatus,
                    originCountry: row.originCountry,
                    originState: row.originState,
                    originLga: row.originLga,
                    residenceCountry: row.residenceCountry,
                    residenceState: row.residenceState,
                    residenceCity: row.residenceCity,
                    occupation: row.occupation,
                    interests: row.interests,
                    matchPreference: isSelf || isSuperAdmin || isAssignedCounselor ? row.matchPreference : undefined,
                    profilePictureUrl: row.profilePictureUrl || ((_b = row.photos[0]) === null || _b === void 0 ? void 0 : _b.url) || null,
                    photos: row.photos,
                    videoIntroUrl: row.videoIntroUrl,
                    church: row.church,
                    branchName: row.branchName,
                    socialMediaHandles: isSelf || isSuperAdmin || isAssignedCounselor ? row.socialMediaHandles : undefined,
                    assignedCounselor: row.assignedCounselor
                        ? {
                            accountId: row.assignedCounselor.account.id,
                            firstName: row.assignedCounselor.account.firstName,
                            lastName: row.assignedCounselor.account.lastName,
                        }
                        : null,
                };
                // Financial & Exact Address Privacy Firewall (ONLY Self, SuperAdmin, Assigned Counselor)
                if (isSelf || isSuperAdmin || isAssignedCounselor) {
                    result.salaryRange = row.salaryRange;
                    result.residenceAddress = row.residenceAddress;
                    result.residenceFormattedAddress = row.residenceFormattedAddress;
                    result.verificationNotes = row.verificationNotes;
                }
                return [2 /*return*/, result];
        }
    });
}); };
exports.getUserById = getUserById;
/**
 * Update user profile with full field support & completion recalculation
 */
var updateUser = function (userIdOrAccountId, data) { return __awaiter(void 0, void 0, void 0, function () {
    var existingUser, cleanedData, mergedForCalculation, completion, counselor, updatedUser;
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    return __generator(this, function (_m) {
        switch (_m.label) {
            case 0: return [4 /*yield*/, db_1.prisma.user.findFirst({
                    where: {
                        OR: [{ id: userIdOrAccountId }, { accountId: userIdOrAccountId }],
                    },
                    include: {
                        photos: true,
                        socialMediaHandles: true,
                    },
                })];
            case 1:
                existingUser = _m.sent();
                if (!existingUser) {
                    throw new Error("User not found");
                }
                cleanedData = {};
                if (data.originCountry !== undefined)
                    cleanedData.originCountry = (_a = data.originCountry) === null || _a === void 0 ? void 0 : _a.trim();
                if (data.originState !== undefined)
                    cleanedData.originState = (_b = data.originState) === null || _b === void 0 ? void 0 : _b.trim();
                if (data.originLga !== undefined)
                    cleanedData.originLga = (_c = data.originLga) === null || _c === void 0 ? void 0 : _c.trim();
                if (data.residenceCountry !== undefined)
                    cleanedData.residenceCountry = (_d = data.residenceCountry) === null || _d === void 0 ? void 0 : _d.trim();
                if (data.residenceState !== undefined)
                    cleanedData.residenceState = (_e = data.residenceState) === null || _e === void 0 ? void 0 : _e.trim();
                if (data.residenceCity !== undefined)
                    cleanedData.residenceCity = (_f = data.residenceCity) === null || _f === void 0 ? void 0 : _f.trim();
                if (data.residenceAddress !== undefined)
                    cleanedData.residenceAddress = (_g = data.residenceAddress) === null || _g === void 0 ? void 0 : _g.trim();
                if (data.residenceLatitude !== undefined)
                    cleanedData.residenceLatitude = data.residenceLatitude;
                if (data.residenceLongitude !== undefined)
                    cleanedData.residenceLongitude = data.residenceLongitude;
                if (data.residencePlaceId !== undefined)
                    cleanedData.residencePlaceId = data.residencePlaceId;
                if (data.residenceFormattedAddress !== undefined)
                    cleanedData.residenceFormattedAddress = data.residenceFormattedAddress;
                if (data.occupation !== undefined)
                    cleanedData.occupation = (_h = data.occupation) === null || _h === void 0 ? void 0 : _h.trim();
                if (data.salaryRange !== undefined)
                    cleanedData.salaryRange = data.salaryRange;
                if (data.churchId !== undefined)
                    cleanedData.churchId = data.churchId;
                if (data.branchName !== undefined)
                    cleanedData.branchName = (_j = data.branchName) === null || _j === void 0 ? void 0 : _j.trim();
                if (data.whatsappNumber !== undefined)
                    cleanedData.whatsappNumber = (_k = data.whatsappNumber) === null || _k === void 0 ? void 0 : _k.trim();
                if (data.matchPreference !== undefined)
                    cleanedData.matchPreference = data.matchPreference;
                if (data.videoIntroUrl !== undefined)
                    cleanedData.videoIntroUrl = (_l = data.videoIntroUrl) === null || _l === void 0 ? void 0 : _l.trim();
                if (data.videoDurationSeconds !== undefined)
                    cleanedData.videoDurationSeconds = data.videoDurationSeconds;
                if (data.interests !== undefined)
                    cleanedData.interests = data.interests;
                if (data.dateOfBirth !== undefined) {
                    cleanedData.dateOfBirth =
                        typeof data.dateOfBirth === "string" ? new Date(data.dateOfBirth) : data.dateOfBirth;
                }
                mergedForCalculation = __assign(__assign(__assign({}, existingUser), cleanedData), { photos: existingUser.photos, socialMediaHandles: existingUser.socialMediaHandles });
                completion = (0, profileCompletion_1.calculateProfileCompletion)(mergedForCalculation);
                cleanedData.profileCompletionPercentage = completion.percentage;
                if (!(completion.isComplete &&
                    (existingUser.vettingStatus === "DRAFT" || existingUser.vettingStatus === "REJECTED"))) return [3 /*break*/, 3];
                cleanedData.vettingStatus = "PENDING_VETTING";
                if (!(!existingUser.assignedCounselorId && cleanedData.churchId)) return [3 /*break*/, 3];
                return [4 /*yield*/, db_1.prisma.counselor.findFirst({
                        where: { churchId: cleanedData.churchId },
                    })];
            case 2:
                counselor = _m.sent();
                if (counselor) {
                    cleanedData.assignedCounselorId = counselor.id;
                }
                _m.label = 3;
            case 3: return [4 /*yield*/, db_1.prisma.user.update({
                    where: { id: existingUser.id },
                    data: cleanedData,
                    include: {
                        photos: { orderBy: { order: "asc" } },
                        socialMediaHandles: true,
                        church: true,
                    },
                })];
            case 4:
                updatedUser = _m.sent();
                return [2 /*return*/, __assign(__assign({}, updatedUser), { completionPercentage: completion.percentage, isComplete: completion.isComplete, missingFields: completion.missingFields })];
        }
    });
}); };
exports.updateUser = updateUser;
/**
 * Manage User Photos (Exactly 3 photos required: orders 1, 2, 3)
 */
var saveUserPhoto = function (accountId, photoUrl, order, publicId) { return __awaiter(void 0, void 0, void 0, function () {
    var user, savedPhoto, allPhotos, completion;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (order < 1 || order > constants_1.REQUIRED_PHOTOS_COUNT) {
                    throw new Error("Photo order must be between 1 and ".concat(constants_1.REQUIRED_PHOTOS_COUNT));
                }
                return [4 /*yield*/, db_1.prisma.user.findUnique({
                        where: { accountId: accountId },
                        include: { photos: true, socialMediaHandles: true },
                    })];
            case 1:
                user = _a.sent();
                if (!user)
                    throw new Error("User not found");
                return [4 /*yield*/, db_1.prisma.userPhoto.upsert({
                        where: {
                            userId_order: {
                                userId: user.id,
                                order: order,
                            },
                        },
                        update: {
                            url: photoUrl,
                            publicId: publicId || null,
                        },
                        create: {
                            userId: user.id,
                            url: photoUrl,
                            order: order,
                            publicId: publicId || null,
                        },
                    })];
            case 2:
                savedPhoto = _a.sent();
                if (!(order === 1)) return [3 /*break*/, 4];
                return [4 /*yield*/, db_1.prisma.user.update({
                        where: { id: user.id },
                        data: { profilePictureUrl: photoUrl },
                    })];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4: return [4 /*yield*/, db_1.prisma.userPhoto.findMany({
                    where: { userId: user.id },
                })];
            case 5:
                allPhotos = _a.sent();
                completion = (0, profileCompletion_1.calculateProfileCompletion)(__assign(__assign({}, user), { photos: allPhotos, socialMediaHandles: user.socialMediaHandles }));
                return [4 /*yield*/, db_1.prisma.user.update({
                        where: { id: user.id },
                        data: __assign({ profileCompletionPercentage: completion.percentage }, (completion.isComplete &&
                            (user.vettingStatus === "DRAFT" || user.vettingStatus === "REJECTED")
                            ? { vettingStatus: "PENDING_VETTING" }
                            : {})),
                    })];
            case 6:
                _a.sent();
                return [2 /*return*/, savedPhoto];
        }
    });
}); };
exports.saveUserPhoto = saveUserPhoto;
var listUserSocialMedia = function (accountId) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.user.findUnique({
                    where: { accountId: accountId },
                    include: {
                        socialMediaHandles: {
                            orderBy: { createdAt: "desc" },
                        },
                    },
                })];
            case 1:
                user = _a.sent();
                if (!user)
                    throw new Error("User not found");
                return [2 /*return*/, user.socialMediaHandles];
        }
    });
}); };
exports.listUserSocialMedia = listUserSocialMedia;
var createUserSocialMedia = function (accountId, payload) { return __awaiter(void 0, void 0, void 0, function () {
    var user, alreadyHasPlatform, created, allSocials, completion;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.user.findUnique({
                    where: { accountId: accountId },
                    include: { photos: true, socialMediaHandles: true },
                })];
            case 1:
                user = _a.sent();
                if (!user)
                    throw new Error("User not found");
                if (!constants_1.SOCIAL_PLATFORM_OPTIONS.includes(payload.platform)) {
                    throw new Error("Invalid platform. Allowed values: ".concat(constants_1.SOCIAL_PLATFORM_OPTIONS.join(", ")));
                }
                alreadyHasPlatform = user.socialMediaHandles.some(function (s) { return s.platform.toLowerCase() === payload.platform.toLowerCase(); });
                if (alreadyHasPlatform) {
                    throw new Error("You have already added a ".concat(payload.platform, " handle"));
                }
                return [4 /*yield*/, db_1.prisma.userSocialMedia.create({
                        data: {
                            userId: user.id,
                            platform: payload.platform,
                            handleOrUrl: payload.handleOrUrl,
                        },
                    })];
            case 2:
                created = _a.sent();
                allSocials = __spreadArray(__spreadArray([], user.socialMediaHandles, true), [created], false);
                completion = (0, profileCompletion_1.calculateProfileCompletion)(__assign(__assign({}, user), { photos: user.photos, socialMediaHandles: allSocials }));
                return [4 /*yield*/, db_1.prisma.user.update({
                        where: { id: user.id },
                        data: __assign({ profileCompletionPercentage: completion.percentage }, (completion.isComplete &&
                            (user.vettingStatus === "DRAFT" || user.vettingStatus === "REJECTED")
                            ? { vettingStatus: "PENDING_VETTING" }
                            : {})),
                    })];
            case 3:
                _a.sent();
                return [2 /*return*/, created];
        }
    });
}); };
exports.createUserSocialMedia = createUserSocialMedia;
var deleteUserSocialMedia = function (accountId, socialId) { return __awaiter(void 0, void 0, void 0, function () {
    var user, social, remainingSocials, completion;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.user.findUnique({
                    where: { accountId: accountId },
                    include: { photos: true, socialMediaHandles: true },
                })];
            case 1:
                user = _a.sent();
                if (!user)
                    throw new Error("User not found");
                social = user.socialMediaHandles.find(function (s) { return s.id === socialId; });
                if (!social) {
                    throw new Error("Social media handle not found");
                }
                return [4 /*yield*/, db_1.prisma.userSocialMedia.delete({
                        where: { id: socialId },
                    })];
            case 2:
                _a.sent();
                remainingSocials = user.socialMediaHandles.filter(function (s) { return s.id !== socialId; });
                completion = (0, profileCompletion_1.calculateProfileCompletion)(__assign(__assign({}, user), { photos: user.photos, socialMediaHandles: remainingSocials }));
                return [4 /*yield*/, db_1.prisma.user.update({
                        where: { id: user.id },
                        data: {
                            profileCompletionPercentage: completion.percentage,
                        },
                    })];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.deleteUserSocialMedia = deleteUserSocialMedia;
