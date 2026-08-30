"use strict";
// controllers/userController.ts
// User resource endpoints
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
exports.removeSocial = exports.addSocial = exports.listSocials = exports.updateStatus = exports.uploadPhoto = exports.update = exports.getOne = exports.list = void 0;
var userService_1 = require("../services/userService");
var mediaService_1 = require("../services/mediaService");
var accountService_1 = require("../services/accountService");
var responseHandler_1 = require("../utils/responseHandler");
/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  SuperAdmin, ChurchAdmin, Counselor
 */
var list = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, isVerified, vettingStatus, subscriptionTier, churchId, page, limit, result, error_1;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                _a = req.query, isVerified = _a.isVerified, vettingStatus = _a.vettingStatus, subscriptionTier = _a.subscriptionTier, churchId = _a.churchId, page = _a.page, limit = _a.limit;
                return [4 /*yield*/, (0, userService_1.getUsers)(((_b = req.account) === null || _b === void 0 ? void 0 : _b.role) || "User", ((_c = req.account) === null || _c === void 0 ? void 0 : _c.id) || "", {
                        isVerified: isVerified === "true"
                            ? true
                            : isVerified === "false"
                                ? false
                                : undefined,
                        vettingStatus: vettingStatus,
                        subscriptionTier: subscriptionTier,
                        churchId: churchId,
                        page: page ? parseInt(page, 10) : undefined,
                        limit: limit ? parseInt(limit, 10) : undefined,
                    })];
            case 1:
                result = _d.sent();
                res.json((0, responseHandler_1.successResponse)("Users fetched successfully", { users: result.users }, result.pagination));
                return [3 /*break*/, 3];
            case 2:
                error_1 = _d.sent();
                res.status(500).json((0, responseHandler_1.errorResponse)(error_1.message || "Server error fetching users"));
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.list = list;
/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  User (own profile), SuperAdmin, Counselor, ChurchAdmin
 */
var getOne = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var targetId, requesterAccountId, requesterRole, user, error_2;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                targetId = String(req.params.id);
                requesterAccountId = ((_a = req.account) === null || _a === void 0 ? void 0 : _a.id) || "";
                requesterRole = ((_b = req.account) === null || _b === void 0 ? void 0 : _b.role) || "User";
                return [4 /*yield*/, (0, userService_1.getUserById)(targetId, requesterAccountId, requesterRole)];
            case 1:
                user = _c.sent();
                res.json((0, responseHandler_1.successResponse)("User fetched successfully", { user: user }));
                return [3 /*break*/, 3];
            case 2:
                error_2 = _c.sent();
                if (error_2.message === "User not found") {
                    return [2 /*return*/, res.status(404).json((0, responseHandler_1.errorResponse)(error_2.message))];
                }
                res.status(500).json((0, responseHandler_1.errorResponse)(error_2.message || "Server error fetching user"));
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getOne = getOne;
/**
 * @desc    Update user profile
 * @route   PUT /api/users/:id
 * @access  User (own profile), SuperAdmin
 */
var update = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var accountId, _a, originCountry, originState, originLga, residenceCountry, residenceState, residenceCity, residenceAddress, residenceLatitude, residenceLongitude, residencePlaceId, residenceFormattedAddress, occupation, salaryRange, interests, churchId, branchName, whatsappNumber, matchPreference, dateOfBirth, videoIntroUrl, videoDurationSeconds, user, error_3;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                accountId = String(req.params.id);
                if (((_b = req.account) === null || _b === void 0 ? void 0 : _b.role) === "User" && ((_c = req.account) === null || _c === void 0 ? void 0 : _c.id) !== accountId) {
                    return [2 /*return*/, res.status(403).json((0, responseHandler_1.errorResponse)("You can only update your own profile"))];
                }
                _a = req.body, originCountry = _a.originCountry, originState = _a.originState, originLga = _a.originLga, residenceCountry = _a.residenceCountry, residenceState = _a.residenceState, residenceCity = _a.residenceCity, residenceAddress = _a.residenceAddress, residenceLatitude = _a.residenceLatitude, residenceLongitude = _a.residenceLongitude, residencePlaceId = _a.residencePlaceId, residenceFormattedAddress = _a.residenceFormattedAddress, occupation = _a.occupation, salaryRange = _a.salaryRange, interests = _a.interests, churchId = _a.church, branchName = _a.branchName, whatsappNumber = _a.whatsappNumber, matchPreference = _a.matchPreference, dateOfBirth = _a.dateOfBirth, videoIntroUrl = _a.videoIntroUrl, videoDurationSeconds = _a.videoDurationSeconds;
                return [4 /*yield*/, (0, userService_1.updateUser)(accountId, {
                        originCountry: originCountry,
                        originState: originState,
                        originLga: originLga,
                        residenceCountry: residenceCountry,
                        residenceState: residenceState,
                        residenceCity: residenceCity,
                        residenceAddress: residenceAddress,
                        residenceLatitude: residenceLatitude,
                        residenceLongitude: residenceLongitude,
                        residencePlaceId: residencePlaceId,
                        residenceFormattedAddress: residenceFormattedAddress,
                        occupation: occupation,
                        salaryRange: salaryRange,
                        interests: interests,
                        churchId: churchId,
                        branchName: branchName,
                        whatsappNumber: whatsappNumber,
                        matchPreference: matchPreference,
                        dateOfBirth: dateOfBirth,
                        videoIntroUrl: videoIntroUrl,
                        videoDurationSeconds: videoDurationSeconds,
                    })];
            case 1:
                user = _d.sent();
                res.json((0, responseHandler_1.successResponse)("User profile updated successfully", { user: user }));
                return [3 /*break*/, 3];
            case 2:
                error_3 = _d.sent();
                res.status(500).json((0, responseHandler_1.errorResponse)(error_3.message || "Server error updating user"));
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.update = update;
/**
 * @desc    Upload profile photo (order: 1, 2, or 3)
 * @route   POST /api/users/:id/photos
 * @access  User (own profile), SuperAdmin
 */
var uploadPhoto = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var accountId, order, uploadResult, savedPhoto, error_4;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                accountId = String(req.params.id);
                order = req.body.order ? parseInt(req.body.order, 10) : 1;
                if (((_a = req.account) === null || _a === void 0 ? void 0 : _a.role) === "User" && ((_b = req.account) === null || _b === void 0 ? void 0 : _b.id) !== accountId) {
                    return [2 /*return*/, res.status(403).json((0, responseHandler_1.errorResponse)("You can only upload photos for your own profile"))];
                }
                if (!req.file) {
                    return [2 /*return*/, res.status(400).json((0, responseHandler_1.errorResponse)("No image file provided"))];
                }
                return [4 /*yield*/, (0, mediaService_1.uploadProfileImageToCloudinary)(req.file.buffer)];
            case 1:
                uploadResult = _c.sent();
                return [4 /*yield*/, (0, userService_1.saveUserPhoto)(accountId, uploadResult.secureUrl, order, uploadResult.publicId)];
            case 2:
                savedPhoto = _c.sent();
                res.json((0, responseHandler_1.successResponse)("Photo uploaded successfully", {
                    photo: savedPhoto,
                }));
                return [3 /*break*/, 4];
            case 3:
                error_4 = _c.sent();
                res.status(500).json((0, responseHandler_1.errorResponse)(error_4.message || "Server error uploading photo"));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.uploadPhoto = uploadPhoto;
/**
 * @desc    Update user status (suspend/activate)
 * @route   PATCH /api/users/:id/status
 * @access  SuperAdmin
 */
var updateStatus = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var accountId, status_1, user, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                accountId = String(req.params.id);
                status_1 = req.body.status;
                if (!status_1 || !["pending", "active", "suspended", "deleted"].includes(status_1)) {
                    return [2 /*return*/, res.status(400).json((0, responseHandler_1.errorResponse)("Invalid status value"))];
                }
                return [4 /*yield*/, (0, accountService_1.updateAccountStatus)(accountId, status_1)];
            case 1:
                user = _a.sent();
                res.json((0, responseHandler_1.successResponse)("User status updated successfully", { user: user }));
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                res.status(500).json((0, responseHandler_1.errorResponse)(error_5.message || "Server error updating status"));
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.updateStatus = updateStatus;
/**
 * @desc    List user's social media handles
 * @route   GET /api/users/:id/socials
 */
var listSocials = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var accountId, socials, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                accountId = String(req.params.id);
                return [4 /*yield*/, (0, userService_1.listUserSocialMedia)(accountId)];
            case 1:
                socials = _a.sent();
                res.json((0, responseHandler_1.successResponse)("Social media handles fetched", { socials: socials }));
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                res.status(500).json((0, responseHandler_1.errorResponse)(error_6.message || "Failed to fetch socials"));
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.listSocials = listSocials;
/**
 * @desc    Add social media handle (LinkedIn, Instagram, Facebook)
 * @route   POST /api/users/:id/socials
 */
var addSocial = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var accountId, _a, platform, handleOrUrl, created, error_7;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                accountId = String(req.params.id);
                _a = req.body, platform = _a.platform, handleOrUrl = _a.handleOrUrl;
                if (((_b = req.account) === null || _b === void 0 ? void 0 : _b.role) === "User" && ((_c = req.account) === null || _c === void 0 ? void 0 : _c.id) !== accountId) {
                    return [2 /*return*/, res.status(403).json((0, responseHandler_1.errorResponse)("Unauthorized"))];
                }
                if (!platform || !handleOrUrl) {
                    return [2 /*return*/, res.status(400).json((0, responseHandler_1.errorResponse)("Platform and handleOrUrl are required"))];
                }
                return [4 /*yield*/, (0, userService_1.createUserSocialMedia)(accountId, {
                        platform: platform,
                        handleOrUrl: handleOrUrl,
                    })];
            case 1:
                created = _d.sent();
                res.status(201).json((0, responseHandler_1.successResponse)("Social media handle added", { social: created }));
                return [3 /*break*/, 3];
            case 2:
                error_7 = _d.sent();
                res.status(400).json((0, responseHandler_1.errorResponse)(error_7.message || "Failed to add social handle"));
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.addSocial = addSocial;
/**
 * @desc    Delete social media handle
 * @route   DELETE /api/users/:id/socials/:socialId
 */
var removeSocial = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var accountId, socialId, error_8;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                accountId = String(req.params.id);
                socialId = String(req.params.socialId);
                if (((_a = req.account) === null || _a === void 0 ? void 0 : _a.role) === "User" && ((_b = req.account) === null || _b === void 0 ? void 0 : _b.id) !== accountId) {
                    return [2 /*return*/, res.status(403).json((0, responseHandler_1.errorResponse)("Unauthorized"))];
                }
                return [4 /*yield*/, (0, userService_1.deleteUserSocialMedia)(accountId, socialId)];
            case 1:
                _c.sent();
                res.json((0, responseHandler_1.successResponse)("Social media handle removed", null));
                return [3 /*break*/, 3];
            case 2:
                error_8 = _c.sent();
                res.status(400).json((0, responseHandler_1.errorResponse)(error_8.message || "Failed to remove social handle"));
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.removeSocial = removeSocial;
