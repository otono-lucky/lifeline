"use strict";
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
exports.listAll = exports.getMatchDetails = exports.getMatchProfile = exports.getPublicProfile = exports.endMatch = exports.getHistoryForAccount = exports.getHistory = exports.getActiveForAccount = exports.getActive = exports.create = void 0;
var matchingService_1 = require("../services/matchingService");
var debriefService_1 = require("../services/debriefService");
var responseHandler_1 = require("../utils/responseHandler");
var create = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, accountIdA, accountIdB, match, error_1;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                console.log("[POST /api/matches] Starting - CreatedBy:", (_b = req.account) === null || _b === void 0 ? void 0 : _b.id);
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 4]);
                _a = req.body, accountIdA = _a.accountIdA, accountIdB = _a.accountIdB;
                if (!accountIdA || !accountIdB) {
                    console.error("[POST /api/matches] Failed: accountIdA/accountIdB required");
                    return [2 /*return*/, res
                            .status(400)
                            .json((0, responseHandler_1.errorResponse)("accountIdA and accountIdB are required"))];
                }
                return [4 /*yield*/, (0, matchingService_1.createManualMatch)(req.account.id, String(accountIdA), String(accountIdB))];
            case 2:
                match = _c.sent();
                console.log("[POST /api/matches] Success - Match:", match.id);
                res.status(201).json((0, responseHandler_1.successResponse)("Match created successfully", { match: match }));
                return [3 /*break*/, 4];
            case 3:
                error_1 = _c.sent();
                console.error("[POST /api/matches] Failed:", error_1.message);
                res
                    .status(400)
                    .json((0, responseHandler_1.errorResponse)(error_1.message || "Server error creating match"));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.create = create;
var getActive = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var match, error_2;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log("[GET /api/matches/active] Starting - Account:", (_a = req.account) === null || _a === void 0 ? void 0 : _a.id);
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, matchingService_1.getActiveMatchForUser)(req.account.id)];
            case 2:
                match = _b.sent();
                console.log("[GET /api/matches/active] Success");
                res.json((0, responseHandler_1.successResponse)("Active match fetched", { match: match }));
                return [3 /*break*/, 4];
            case 3:
                error_2 = _b.sent();
                console.error("[GET /api/matches/active] Failed:", error_2.message);
                res
                    .status(400)
                    .json((0, responseHandler_1.errorResponse)(error_2.message || "Server error fetching active match"));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getActive = getActive;
var getActiveForAccount = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var match, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("[GET /api/matches/active/:accountId] Starting - Target:", req.params.accountId);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, matchingService_1.getActiveMatchForUser)(String(req.params.accountId))];
            case 2:
                match = _a.sent();
                console.log("[GET /api/matches/active/:accountId] Success");
                res.json((0, responseHandler_1.successResponse)("Active match fetched", { match: match }));
                return [3 /*break*/, 4];
            case 3:
                error_3 = _a.sent();
                console.error("[GET /api/matches/active/:accountId] Failed:", error_3.message);
                res
                    .status(400)
                    .json((0, responseHandler_1.errorResponse)(error_3.message || "Server error fetching active match"));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getActiveForAccount = getActiveForAccount;
var getHistory = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var matches, error_4;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log("[GET /api/matches/history] Starting - Account:", (_a = req.account) === null || _a === void 0 ? void 0 : _a.id);
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, matchingService_1.getMatchHistoryForUser)(req.account.id)];
            case 2:
                matches = _b.sent();
                console.log("[GET /api/matches/history] Success");
                res.json((0, responseHandler_1.successResponse)("Match history fetched", { matches: matches }));
                return [3 /*break*/, 4];
            case 3:
                error_4 = _b.sent();
                console.error("[GET /api/matches/history] Failed:", error_4.message);
                res
                    .status(400)
                    .json((0, responseHandler_1.errorResponse)(error_4.message || "Server error fetching match history"));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getHistory = getHistory;
var getHistoryForAccount = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var matches, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("[GET /api/matches/history/:accountId] Starting - Target:", req.params.accountId);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, matchingService_1.getMatchHistoryForUser)(String(req.params.accountId))];
            case 2:
                matches = _a.sent();
                console.log("[GET /api/matches/history/:accountId] Success");
                res.json((0, responseHandler_1.successResponse)("Match history fetched", { matches: matches }));
                return [3 /*break*/, 4];
            case 3:
                error_5 = _a.sent();
                console.error("[GET /api/matches/history/:accountId] Failed:", error_5.message);
                res
                    .status(400)
                    .json((0, responseHandler_1.errorResponse)(error_5.message || "Server error fetching match history"));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getHistoryForAccount = getHistoryForAccount;
var endMatch = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var matchId, reason, result, error_6;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log("[POST /api/matches/:matchId/end] Starting - Match:", req.params.matchId, "Account:", (_a = req.account) === null || _a === void 0 ? void 0 : _a.id);
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                matchId = String(req.params.matchId);
                reason = req.body.reason;
                return [4 /*yield*/, (0, debriefService_1.endRelationshipMatch)(req.account.id, matchId, reason)];
            case 2:
                result = _b.sent();
                console.log("[POST /api/matches/:matchId/end] Success");
                res.json((0, responseHandler_1.successResponse)(result.message, null));
                return [3 /*break*/, 4];
            case 3:
                error_6 = _b.sent();
                console.error("[POST /api/matches/:matchId/end] Failed:", error_6.message);
                res
                    .status(400)
                    .json((0, responseHandler_1.errorResponse)(error_6.message || "Server error ending match"));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.endMatch = endMatch;
var getPublicProfile = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var targetAccountId, profile, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("[GET /api/matches/public-profile/:accountId] Starting - Target:", req.params.accountId);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                targetAccountId = String(req.params.accountId);
                return [4 /*yield*/, (0, matchingService_1.getMatchPublicProfile)(req.account.id, targetAccountId)];
            case 2:
                profile = _a.sent();
                console.log("[GET /api/matches/public-profile/:accountId] Success");
                res.json((0, responseHandler_1.successResponse)("Public profile fetched", { profile: profile }));
                return [3 /*break*/, 4];
            case 3:
                error_7 = _a.sent();
                console.error("[GET /api/matches/public-profile/:accountId] Failed:", error_7.message);
                res
                    .status(400)
                    .json((0, responseHandler_1.errorResponse)(error_7.message || "Server error fetching public profile"));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getPublicProfile = getPublicProfile;
var getMatchProfile = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var matchId, targetAccountId, profile, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("[GET /api/matches/:matchId/profile/:accountId] Starting - Match:", req.params.matchId, "Target:", req.params.accountId);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                matchId = String(req.params.matchId);
                targetAccountId = String(req.params.accountId);
                return [4 /*yield*/, (0, matchingService_1.getMatchPublicProfileForMatch)(req.account.id, req.account.role, matchId, targetAccountId)];
            case 2:
                profile = _a.sent();
                console.log("[GET /api/matches/:matchId/profile/:accountId] Success");
                res.json((0, responseHandler_1.successResponse)("Public profile fetched", { profile: profile }));
                return [3 /*break*/, 4];
            case 3:
                error_8 = _a.sent();
                console.error("[GET /api/matches/:matchId/profile/:accountId] Failed:", error_8.message);
                res
                    .status(400)
                    .json((0, responseHandler_1.errorResponse)(error_8.message || "Server error fetching public profile"));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getMatchProfile = getMatchProfile;
var getMatchDetails = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var matchId, match, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("[GET /api/matches/:matchId] Starting - Match:", req.params.matchId);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                matchId = String(req.params.matchId);
                return [4 /*yield*/, (0, matchingService_1.getMatchById)(req.account.id, req.account.role, matchId)];
            case 2:
                match = _a.sent();
                console.log("[GET /api/matches/:matchId] Success");
                res.json((0, responseHandler_1.successResponse)("Match fetched", { match: match }));
                return [3 /*break*/, 4];
            case 3:
                error_9 = _a.sent();
                console.error("[GET /api/matches/:matchId] Failed:", error_9.message);
                res
                    .status(400)
                    .json((0, responseHandler_1.errorResponse)(error_9.message || "Server error fetching match"));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getMatchDetails = getMatchDetails;
var listAll = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, status_1, createdBy, counselorId, churchId, dateFrom, dateTo, page, limit, result, error_10;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                console.log("[GET /api/matches] Starting - Account:", (_b = req.account) === null || _b === void 0 ? void 0 : _b.id);
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 4]);
                _a = req.query, status_1 = _a.status, createdBy = _a.createdBy, counselorId = _a.counselorId, churchId = _a.churchId, dateFrom = _a.dateFrom, dateTo = _a.dateTo, page = _a.page, limit = _a.limit;
                return [4 /*yield*/, (0, matchingService_1.listMatches)({
                        status: status_1,
                        createdBy: createdBy ? String(createdBy) : undefined,
                        counselorId: counselorId ? String(counselorId) : undefined,
                        churchId: churchId ? String(churchId) : undefined,
                        dateFrom: dateFrom ? new Date(String(dateFrom)) : undefined,
                        dateTo: dateTo ? new Date(String(dateTo)) : undefined,
                        page: page ? parseInt(String(page)) : undefined,
                        limit: limit ? parseInt(String(limit)) : undefined,
                    })];
            case 2:
                result = _c.sent();
                res.json((0, responseHandler_1.successResponse)("Matches fetched", { matches: result.matches }, result.pagination));
                console.log("[GET /api/matches] Success");
                return [3 /*break*/, 4];
            case 3:
                error_10 = _c.sent();
                console.error("[GET /api/matches] Failed:", error_10.message);
                res
                    .status(400)
                    .json((0, responseHandler_1.errorResponse)(error_10.message || "Server error fetching matches"));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.listAll = listAll;
