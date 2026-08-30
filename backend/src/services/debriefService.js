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
exports.resetUserAfterDebrief = exports.endRelationshipMatch = void 0;
var db_1 = require("../config/db");
var endRelationshipMatch = function (requesterAccountId, matchId, reason) { return __awaiter(void 0, void 0, void 0, function () {
    var match;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.match.findUnique({
                    where: { id: matchId },
                    include: {
                        participants: {
                            include: {
                                user: true,
                            },
                        },
                    },
                })];
            case 1:
                match = _a.sent();
                if (!match) {
                    throw new Error("Match not found");
                }
                // Update match status and transition users to DEBRIEF_REQUIRED
                return [4 /*yield*/, db_1.prisma.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        var _i, _a, participant;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, tx.match.update({
                                        where: { id: matchId },
                                        data: {
                                            status: "ENDED",
                                            endedAt: new Date(),
                                        },
                                    })];
                                case 1:
                                    _b.sent();
                                    _i = 0, _a = match.participants;
                                    _b.label = 2;
                                case 2:
                                    if (!(_i < _a.length)) return [3 /*break*/, 5];
                                    participant = _a[_i];
                                    return [4 /*yield*/, tx.user.update({
                                            where: { id: participant.userId },
                                            data: {
                                                vettingStatus: "DEBRIEF_REQUIRED",
                                                isDiscoveryIndexed: false,
                                            },
                                        })];
                                case 3:
                                    _b.sent();
                                    _b.label = 4;
                                case 4:
                                    _i++;
                                    return [3 /*break*/, 2];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); })];
            case 2:
                // Update match status and transition users to DEBRIEF_REQUIRED
                _a.sent();
                return [2 /*return*/, {
                        success: true,
                        message: "Relationship concluded. Both participants must undergo a counselor debrief before re-entering discovery.",
                    }];
        }
    });
}); };
exports.endRelationshipMatch = endRelationshipMatch;
var resetUserAfterDebrief = function (counselorAccountId, userAccountId, data) { return __awaiter(void 0, void 0, void 0, function () {
    var counselor, user, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.counselor.findUnique({
                    where: { accountId: counselorAccountId },
                    select: { id: true },
                })];
            case 1:
                counselor = _a.sent();
                if (!counselor) {
                    throw new Error("Counselor not found");
                }
                return [4 /*yield*/, db_1.prisma.user.findUnique({
                        where: { accountId: userAccountId },
                        select: { id: true, vettingStatus: true },
                    })];
            case 2:
                user = _a.sent();
                if (!user) {
                    throw new Error("User not found");
                }
                return [4 /*yield*/, db_1.prisma.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        var debrief, updatedUser;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, tx.counselorDebrief.create({
                                        data: {
                                            counselorId: counselor.id,
                                            userId: user.id,
                                            matchId: data.matchId || null,
                                            notes: data.notes,
                                            readinessScore: data.readinessScore || 10,
                                            clearedForDiscoveryAt: new Date(),
                                        },
                                    })];
                                case 1:
                                    debrief = _a.sent();
                                    return [4 /*yield*/, tx.user.update({
                                            where: { id: user.id },
                                            data: {
                                                vettingStatus: "VETTED_ACTIVE",
                                                isDiscoveryIndexed: true,
                                            },
                                        })];
                                case 2:
                                    updatedUser = _a.sent();
                                    return [2 /*return*/, { debrief: debrief, updatedUser: updatedUser }];
                            }
                        });
                    }); })];
            case 3:
                result = _a.sent();
                return [2 /*return*/, {
                        success: true,
                        message: "Debrief completed successfully. Member has been re-indexed into the discovery pool.",
                        debriefId: result.debrief.id,
                        vettingStatus: result.updatedUser.vettingStatus,
                    }];
        }
    });
}); };
exports.resetUserAfterDebrief = resetUserAfterDebrief;
