"use strict";
// controllers/counsellorController.ts
// Counselor endpoints with unified responses
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
exports.updateStatus = exports.update = exports.getOne = exports.list = exports.getAllCounselors = exports.createCounselorAccount = exports.updateCounselorDetails = exports.getCounselorDetails = exports.getMyAssignedUsers = exports.getDashboard = void 0;
var counsellorService_1 = require("../services/counsellorService");
var accountService_1 = require("../services/accountService");
var tokenManager_1 = require("../utils/tokenManager");
var responseHandler_1 = require("../utils/responseHandler");
var db_1 = require("../config/db");
var constants_1 = require("../constants");
/**
 * @desc    Get Counselor dashboard
 * @route   GET /api/counselor/dashboard
 * @access  Counselor, ChurchAdmin
 */
var getDashboard = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var dashboard, error_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, counsellorService_1.getCounselorDashboard)(req.account.id, (_a = req.params) === null || _a === void 0 ? void 0 : _a.id)];
            case 1:
                dashboard = _b.sent();
                res.json((0, responseHandler_1.successResponse)("Dashboard data fetched successfully", dashboard));
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                res
                    .status(500)
                    .json((0, responseHandler_1.errorResponse)(error_1.message || "Server error fetching dashboard"));
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getDashboard = getDashboard;
/**
 * @desc    Get assigned users
 * @route   GET /api/counselor/assigned-users
 * @access  Counselor
 */
var getMyAssignedUsers = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, verificationStatus, vettingStatus, page, limit, id, result, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, verificationStatus = _a.verificationStatus, vettingStatus = _a.vettingStatus, page = _a.page, limit = _a.limit;
                id = req.params.id;
                return [4 /*yield*/, (0, counsellorService_1.getAssignedUsers)(req.account.id, id, {
                        vettingStatus: (vettingStatus || verificationStatus),
                        page: page ? parseInt(page, 10) : undefined,
                        limit: limit ? parseInt(limit, 10) : undefined,
                    })];
            case 1:
                result = _b.sent();
                res.json((0, responseHandler_1.successResponse)("Assigned users fetched successfully", { users: result.users }, result.pagination));
                return [3 /*break*/, 3];
            case 2:
                error_2 = _b.sent();
                res
                    .status(500)
                    .json((0, responseHandler_1.errorResponse)(error_2.message || "Server error fetching assigned users"));
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getMyAssignedUsers = getMyAssignedUsers;
/**
 * @desc    Get single counselor by ID
 * @route   GET /api/counselor/:id
 * @access  Counselor (own profile), ChurchAdmin, SuperAdmin
 */
var getCounselorDetails = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, counselor, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                if (req.account.role === "Counselor" && req.account.id !== id) {
                    return [2 /*return*/, res
                            .status(403)
                            .json((0, responseHandler_1.errorResponse)("You can only view your own profile"))];
                }
                return [4 /*yield*/, (0, counsellorService_1.getCounselorById)(id)];
            case 1:
                counselor = _a.sent();
                res.json((0, responseHandler_1.successResponse)("Counselor fetched successfully", { counselor: counselor }));
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                if (error_3.message === "Counselor not found") {
                    return [2 /*return*/, res.status(404).json((0, responseHandler_1.errorResponse)(error_3.message))];
                }
                res
                    .status(500)
                    .json((0, responseHandler_1.errorResponse)(error_3.message || "Server error fetching counselor"));
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getCounselorDetails = getCounselorDetails;
/**
 * @desc    Update counselor details
 * @route   PUT /api/counselor/:id
 * @access  Counselor (own profile), ChurchAdmin, SuperAdmin
 */
var updateCounselorDetails = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, bio, counselor, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                bio = req.body.bio;
                if (req.account.role === "Counselor" && req.account.id !== id) {
                    return [2 /*return*/, res
                            .status(403)
                            .json((0, responseHandler_1.errorResponse)("You can only update your own profile"))];
                }
                return [4 /*yield*/, (0, counsellorService_1.updateCounselor)(id, { bio: bio })];
            case 1:
                counselor = _a.sent();
                res.json((0, responseHandler_1.successResponse)("Counselor updated successfully", { counselor: counselor }));
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                res
                    .status(500)
                    .json((0, responseHandler_1.errorResponse)(error_4.message || "Server error updating counselor"));
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.updateCounselorDetails = updateCounselorDetails;
/**
 * @desc    Create counselor account
 * @route   POST /api/counselor/create
 * @access  ChurchAdmin, SuperAdmin
 */
var createCounselorAccount = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, churchId, email, password, firstName, lastName, phone, bio, targetChurchId, churchAdmin, result, token, error_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = req.body, churchId = _a.churchId, email = _a.email, password = _a.password, firstName = _a.firstName, lastName = _a.lastName, phone = _a.phone, bio = _a.bio;
                targetChurchId = churchId;
                if (!(req.account.role === "ChurchAdmin")) return [3 /*break*/, 2];
                return [4 /*yield*/, db_1.prisma.churchAdmin.findUnique({
                        where: { accountId: req.account.id },
                        select: { churchId: true },
                    })];
            case 1:
                churchAdmin = _b.sent();
                if (!churchAdmin) {
                    return [2 /*return*/, res
                            .status(403)
                            .json((0, responseHandler_1.errorResponse)("Church admin profile not found"))];
                }
                targetChurchId = churchAdmin.churchId;
                _b.label = 2;
            case 2:
                if (!targetChurchId || !email || !password || !firstName || !lastName) {
                    return [2 /*return*/, res.status(400).json((0, responseHandler_1.errorResponse)("Missing required fields", {
                            required: ["churchId", "email", "password", "firstName", "lastName"],
                        }))];
                }
                return [4 /*yield*/, (0, accountService_1.createCounselor)({
                        churchId: targetChurchId,
                        email: email,
                        password: password,
                        firstName: firstName,
                        lastName: lastName,
                        phone: phone,
                        bio: bio,
                        role: "Counselor",
                    })];
            case 3:
                result = _b.sent();
                token = (0, tokenManager_1.generateToken)({
                    id: result.account.id,
                    email: result.account.email,
                    role: result.account.role,
                    firstName: result.account.firstName,
                });
                res.status(201).json((0, responseHandler_1.successResponse)("Counselor account created successfully", {
                    account: {
                        id: result.account.id,
                        email: result.account.email,
                        firstName: result.account.firstName,
                        lastName: result.account.lastName,
                        role: result.account.role,
                    },
                    counselor: {
                        accountId: result.account.id,
                        churchId: result.counselor.churchId,
                    },
                    token: token,
                }));
                return [3 /*break*/, 5];
            case 4:
                error_5 = _b.sent();
                res
                    .status(500)
                    .json((0, responseHandler_1.errorResponse)(error_5.message || "Server error creating counselor"));
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.createCounselorAccount = createCounselorAccount;
/**
 * @desc    Get all counselors (SuperAdmin only)
 * @route   GET /api/counselor/list-all
 * @access  SuperAdmin
 */
var getAllCounselors = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, status_1, page, limit, superAdmin, counselors, error_6;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.query, status_1 = _a.status, page = _a.page, limit = _a.limit;
                if (status_1 && !constants_1.STATUS_TYPES.includes(status_1)) {
                    return [2 /*return*/, res
                            .status(400)
                            .json((0, responseHandler_1.errorResponse)("Invalid status. Must be 'pending', 'active', 'suspended', 'deleted'"))];
                }
                return [4 /*yield*/, db_1.prisma.superAdmin.findUnique({
                        where: { accountId: req.account.id },
                    })];
            case 1:
                superAdmin = _b.sent();
                if (!superAdmin) {
                    return [2 /*return*/, res
                            .status(403)
                            .json((0, responseHandler_1.errorResponse)("Super admin profile required"))];
                }
                return [4 /*yield*/, (0, counsellorService_1.getCounselors)({
                        status: status_1,
                        page: page ? parseInt(page, 10) : undefined,
                        limit: limit ? parseInt(limit, 10) : undefined,
                    })];
            case 2:
                counselors = _b.sent();
                res.json((0, responseHandler_1.successResponse)("Counselors fetched successfully", { counselors: counselors }));
                return [3 /*break*/, 4];
            case 3:
                error_6 = _b.sent();
                res
                    .status(500)
                    .json((0, responseHandler_1.errorResponse)(error_6.message || "Server error fetching counselors"));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getAllCounselors = getAllCounselors;
/**
 * @desc    Get counselors for a church
 * @route   GET /api/counselor/list
 * @access  ChurchAdmin, SuperAdmin
 */
var list = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var churchId, churchAdmin, counselors, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                churchId = req.query.churchId;
                if (!(req.account.role === "ChurchAdmin")) return [3 /*break*/, 2];
                return [4 /*yield*/, db_1.prisma.churchAdmin.findUnique({
                        where: { accountId: req.account.id },
                        select: { churchId: true },
                    })];
            case 1:
                churchAdmin = _a.sent();
                if (!churchAdmin) {
                    return [2 /*return*/, res
                            .status(403)
                            .json((0, responseHandler_1.errorResponse)("Church admin profile not found"))];
                }
                churchId = churchAdmin.churchId;
                _a.label = 2;
            case 2:
                if (!churchId) {
                    return [2 /*return*/, res.status(400).json((0, responseHandler_1.errorResponse)("churchId is required"))];
                }
                return [4 /*yield*/, (0, counsellorService_1.getCounselorsByChurch)(churchId)];
            case 3:
                counselors = _a.sent();
                res.json((0, responseHandler_1.successResponse)("Counselors fetched successfully", { counselors: counselors }));
                return [3 /*break*/, 5];
            case 4:
                error_7 = _a.sent();
                res
                    .status(500)
                    .json((0, responseHandler_1.errorResponse)(error_7.message || "Server error fetching counselors"));
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.list = list;
exports.getOne = exports.getCounselorDetails;
exports.update = exports.updateCounselorDetails;
var updateStatus = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, status_2, updateAccountStatus, account, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                id = req.params.id;
                status_2 = req.body.status;
                return [4 /*yield*/, Promise.resolve().then(function () { return require("../services/accountService"); })];
            case 1:
                updateAccountStatus = (_a.sent()).updateAccountStatus;
                return [4 /*yield*/, updateAccountStatus(id, status_2)];
            case 2:
                account = _a.sent();
                res.json((0, responseHandler_1.successResponse)("Counselor status updated", { account: account }));
                return [3 /*break*/, 4];
            case 3:
                error_8 = _a.sent();
                res.status(500).json((0, responseHandler_1.errorResponse)(error_8.message || "Server error updating status"));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.updateStatus = updateStatus;
