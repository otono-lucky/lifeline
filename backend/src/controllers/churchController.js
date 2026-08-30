"use strict";
// controllers/church.controller.ts
// Church resource endpoints
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
exports.update = exports.updateStatus = exports.getMembers = exports.getOne = exports.publicList = exports.list = exports.create = void 0;
var churchService_1 = require("../services/churchService");
var db_1 = require("../config/db");
var responseHandler_1 = require("../utils/responseHandler");
/**
 * @desc    Create a new church
 * @route   POST /api/churches
 * @access  SuperAdmin
 */
var create = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, officialName, aka, email, phone, state, lga, city, address, superAdmin, church, error_1;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                console.log("[POST /api/churches] Starting - Email:", (_b = req.body) === null || _b === void 0 ? void 0 : _b.email);
                _c.label = 1;
            case 1:
                _c.trys.push([1, 4, , 5]);
                _a = req.body, officialName = _a.officialName, aka = _a.aka, email = _a.email, phone = _a.phone, state = _a.state, lga = _a.lga, city = _a.city, address = _a.address;
                // Validation
                if (!officialName || !email || !phone || !state) {
                    return [2 /*return*/, res
                            .status(400)
                            .json((0, responseHandler_1.errorResponse)("Missing required fields: officialName, email, phone, state"))];
                }
                return [4 /*yield*/, db_1.prisma.superAdmin.findUnique({
                        where: { accountId: req.account.id },
                    })];
            case 2:
                superAdmin = _c.sent();
                if (!superAdmin) {
                    return [2 /*return*/, res
                            .status(403)
                            .json((0, responseHandler_1.errorResponse)("SuperAdmin profile not found"))];
                }
                return [4 /*yield*/, (0, churchService_1.createChurch)({
                        officialName: officialName,
                        aka: aka,
                        email: email,
                        phone: phone,
                        state: state,
                        lga: lga,
                        city: city,
                        address: address,
                        createdBy: superAdmin.id,
                    })];
            case 3:
                church = _c.sent();
                console.log("[POST /api/churches] Success - ChurchId:", church.id);
                res
                    .status(201)
                    .json((0, responseHandler_1.successResponse)("Church created successfully", { church: church }));
                return [3 /*break*/, 5];
            case 4:
                error_1 = _c.sent();
                console.error("[POST /api/churches] Failed:", error_1.message);
                res
                    .status(500)
                    .json((0, responseHandler_1.errorResponse)(error_1.message || "Server error creating church"));
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.create = create;
/**
 * @desc    Get all churches
 * @route   GET /api/churches
 * @access  SuperAdmin
 */
var list = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, status_1, page, limit, result, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log("[GET /api/churches] Starting");
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                _a = req.query, status_1 = _a.status, page = _a.page, limit = _a.limit;
                return [4 /*yield*/, (0, churchService_1.getChurches)({
                        status: status_1,
                        page: page ? parseInt(page) : undefined,
                        limit: limit ? parseInt(limit) : undefined,
                    })];
            case 2:
                result = _b.sent();
                console.log("[GET /api/churches] Success - Count:", result.churches.length);
                res.json((0, responseHandler_1.successResponse)("Churches fetched successfully", { churches: result.churches }, result.pagination));
                return [3 /*break*/, 4];
            case 3:
                error_2 = _b.sent();
                console.error("[GET /api/churches] Failed:", error_2.message);
                res
                    .status(500)
                    .json((0, responseHandler_1.errorResponse)(error_2.message || "Server error fetching churches"));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.list = list;
/**
 * @desc    Public list of active churches (minimal fields)
 * @route   GET /api/churches/public
 * @access  Public
 */
var publicList = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var limit, getPublicChurches, churches, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('[GET /api/churches/public] Starting');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                limit = req.query.limit;
                return [4 /*yield*/, Promise.resolve().then(function () { return require('../services/churchService'); })];
            case 2:
                getPublicChurches = (_a.sent()).getPublicChurches;
                return [4 /*yield*/, getPublicChurches({
                        limit: limit ? parseInt(limit) : undefined,
                    })];
            case 3:
                churches = _a.sent();
                console.log('[GET /api/churches/public] Success - Count:', churches.length);
                res.json((0, responseHandler_1.successResponse)('Churches fetched successfully', { churches: churches }));
                return [3 /*break*/, 5];
            case 4:
                error_3 = _a.sent();
                console.error('[GET /api/churches/public] Failed:', error_3.message);
                res.status(500).json((0, responseHandler_1.errorResponse)(error_3.message || 'Server error fetching churches'));
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.publicList = publicList;
/**
 * @desc    Get single church
 * @route   GET /api/churches/:id
 * @access  SuperAdmin, ChurchAdmin (own church)
 */
var getOne = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, church, error_4;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log("[GET /api/churches/:id] Starting - Id:", (_a = req.params) === null || _a === void 0 ? void 0 : _a.id);
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                id = String(req.params.id);
                return [4 /*yield*/, (0, churchService_1.getChurchById)(id)];
            case 2:
                church = _b.sent();
                console.log("[GET /api/churches/:id] Success - Id:", church.id);
                res.json((0, responseHandler_1.successResponse)("Church fetched successfully", { church: church }));
                return [3 /*break*/, 4];
            case 3:
                error_4 = _b.sent();
                console.error("[GET /api/churches/:id] Failed:", error_4.message);
                if (error_4.message === "Church not found") {
                    return [2 /*return*/, res.status(404).json((0, responseHandler_1.errorResponse)(error_4.message))];
                }
                res
                    .status(500)
                    .json((0, responseHandler_1.errorResponse)(error_4.message || "Server error fetching church"));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getOne = getOne;
var getMembers = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, verificationStatus, page, limit, id, result, error_5;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                console.log("[GET /api/churches/:id/members] Starting - ChurchId:", (_b = req.params) === null || _b === void 0 ? void 0 : _b.id);
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 4]);
                _a = req.query, verificationStatus = _a.verificationStatus, page = _a.page, limit = _a.limit;
                id = req.params.id;
                return [4 /*yield*/, (0, churchService_1.getChurchMembers)(req.account.id, {
                        churchId: id,
                        vettingStatus: (verificationStatus || req.query.vettingStatus),
                        page: page ? parseInt(page) : undefined,
                        limit: limit ? parseInt(limit) : undefined,
                    })];
            case 2:
                result = _c.sent();
                console.log("[GET /api/churches/:id/members] Success - Count:", result.members.length);
                res.json((0, responseHandler_1.successResponse)("Members fetched successfully", { members: result.members }, result.pagination));
                return [3 /*break*/, 4];
            case 3:
                error_5 = _c.sent();
                console.error("[GET /api/churches/:id/members] Failed:", error_5.message);
                res
                    .status(500)
                    .json((0, responseHandler_1.errorResponse)(error_5.message || "Server error fetching members"));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getMembers = getMembers;
/**
 * @desc    Update church details
 * @route   PUT /api/churches/:id
 * @access  SuperAdmin
 */
var updateStatus = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, status_2, church, error_6;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                console.log("[PUT /api/churches/:id/status] Starting - Id:", (_a = req.params) === null || _a === void 0 ? void 0 : _a.id);
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 4]);
                id = (_b = req.params) === null || _b === void 0 ? void 0 : _b.id;
                status_2 = req.body.status;
                if (!["active", "suspended"].includes(status_2)) {
                    console.error("[PUT /api/churches/:id/status] Failed: Invalid status");
                    return [2 /*return*/, res
                            .status(400)
                            .json((0, responseHandler_1.errorResponse)("Invalid status. Must be: active or suspended"))];
                }
                return [4 /*yield*/, (0, churchService_1.updateChurchStatus)(id, status_2)];
            case 2:
                church = _c.sent();
                console.log("[PUT /api/churches/:id/status] Success - Status:", church.status);
                res.json((0, responseHandler_1.successResponse)("Church activated successfully", { church: church }));
                return [3 /*break*/, 4];
            case 3:
                error_6 = _c.sent();
                console.error("[PUT /api/churches/:id/status] Failed:", error_6.message);
                res
                    .status(500)
                    .json((0, responseHandler_1.errorResponse)(error_6.message || "Server error updating church"));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.updateStatus = updateStatus;
var update = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, officialName, aka, phone, state, lga, city, address, church, error_7;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                console.log("[PUT /api/churches/:id] Starting - Id:", (_b = req.params) === null || _b === void 0 ? void 0 : _b.id);
                _d.label = 1;
            case 1:
                _d.trys.push([1, 3, , 4]);
                id = String((_c = req.params) === null || _c === void 0 ? void 0 : _c.id);
                _a = req.body, officialName = _a.officialName, aka = _a.aka, phone = _a.phone, state = _a.state, lga = _a.lga, city = _a.city, address = _a.address;
                return [4 /*yield*/, (0, churchService_1.updateChurch)(id, {
                        officialName: officialName,
                        aka: aka,
                        phone: phone,
                        state: state,
                        lga: lga,
                        city: city,
                        address: address,
                    })];
            case 2:
                church = _d.sent();
                console.log("[PUT /api/churches/:id] Success - Id:", church.id);
                res.json((0, responseHandler_1.successResponse)("Church updated successfully", { church: church }));
                return [3 /*break*/, 4];
            case 3:
                error_7 = _d.sent();
                console.error("[PUT /api/churches/:id] Failed:", error_7.message);
                res
                    .status(500)
                    .json((0, responseHandler_1.errorResponse)(error_7.message || "Server error updating church"));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.update = update;
