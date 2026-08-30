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
exports.debriefReset = exports.reviewAppeal = exports.appealBlock = exports.reviewVetting = void 0;
var vettingService_1 = require("../services/vettingService");
var debriefService_1 = require("../services/debriefService");
var reviewVetting = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var counselorAccountId, userId, _a, decision, reason, notes, result, error_1;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                counselorAccountId = (_b = req.account) === null || _b === void 0 ? void 0 : _b.id;
                userId = req.params.userId;
                _a = req.body, decision = _a.decision, reason = _a.reason, notes = _a.notes;
                if (!counselorAccountId) {
                    return [2 /*return*/, res.status(401).json({ success: false, message: "Unauthorized" })];
                }
                if (!decision || !["APPROVE", "REJECT", "HARD_BLOCK"].includes(decision)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Valid decision required: APPROVE, REJECT, or HARD_BLOCK",
                        })];
                }
                return [4 /*yield*/, (0, vettingService_1.reviewUserVetting)(counselorAccountId, userId, decision, reason, notes)];
            case 1:
                result = _c.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        message: "User vetting ".concat(decision.toLowerCase(), "d successfully"),
                        data: result,
                        errors: null,
                    })];
            case 2:
                error_1 = _c.sent();
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        message: error_1.message || "Failed to process vetting review",
                        errors: error_1.message,
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.reviewVetting = reviewVetting;
var appealBlock = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userAccountId, appealReason, appeal, error_2;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userAccountId = (_a = req.account) === null || _a === void 0 ? void 0 : _a.id;
                appealReason = req.body.appealReason;
                if (!userAccountId) {
                    return [2 /*return*/, res.status(401).json({ success: false, message: "Unauthorized" })];
                }
                if (!appealReason) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "appealReason is required",
                        })];
                }
                return [4 /*yield*/, (0, vettingService_1.submitAppealRequest)(userAccountId, appealReason)];
            case 1:
                appeal = _b.sent();
                return [2 /*return*/, res.status(201).json({
                        success: true,
                        message: "Appeal submitted successfully. System administrators will review your account.",
                        data: appeal,
                        errors: null,
                    })];
            case 2:
                error_2 = _b.sent();
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        message: error_2.message || "Failed to submit appeal",
                        errors: error_2.message,
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.appealBlock = appealBlock;
var reviewAppeal = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var superAdminAccountId, appealId, status_1, result, error_3;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                superAdminAccountId = (_a = req.account) === null || _a === void 0 ? void 0 : _a.id;
                appealId = req.params.appealId;
                status_1 = req.body.status;
                if (!superAdminAccountId) {
                    return [2 /*return*/, res.status(401).json({ success: false, message: "Unauthorized" })];
                }
                if (!["APPROVED", "REJECTED"].includes(status_1)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Status must be APPROVED or REJECTED",
                        })];
                }
                return [4 /*yield*/, (0, vettingService_1.reviewAppealRequest)(superAdminAccountId, appealId, status_1)];
            case 1:
                result = _b.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        message: "Appeal has been ".concat(status_1.toLowerCase()),
                        data: result,
                        errors: null,
                    })];
            case 2:
                error_3 = _b.sent();
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        message: error_3.message || "Failed to review appeal",
                        errors: error_3.message,
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.reviewAppeal = reviewAppeal;
var debriefReset = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var counselorAccountId, userId, _a, notes, readinessScore, matchId, result, error_4;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                counselorAccountId = (_b = req.account) === null || _b === void 0 ? void 0 : _b.id;
                userId = req.params.userId;
                _a = req.body, notes = _a.notes, readinessScore = _a.readinessScore, matchId = _a.matchId;
                if (!counselorAccountId) {
                    return [2 /*return*/, res.status(401).json({ success: false, message: "Unauthorized" })];
                }
                if (!notes) {
                    return [2 /*return*/, res.status(400).json({ success: false, message: "Debrief notes are required" })];
                }
                return [4 /*yield*/, (0, debriefService_1.resetUserAfterDebrief)(counselorAccountId, userId, {
                        matchId: matchId,
                        notes: notes,
                        readinessScore: readinessScore,
                    })];
            case 1:
                result = _c.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        message: result.message,
                        data: result,
                        errors: null,
                    })];
            case 2:
                error_4 = _c.sent();
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        message: error_4.message || "Failed to complete debrief reset",
                        errors: error_4.message,
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.debriefReset = debriefReset;
