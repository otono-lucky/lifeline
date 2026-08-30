"use strict";
// services/accountService.ts
// Account resource management (creation, auth, etc.)
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
exports.changePassword = exports.updateAccountStatus = exports.createCounselor = exports.createChurchAdmin = exports.createAccount = void 0;
var db_1 = require("../config/db");
var churchService_1 = require("./churchService");
var passwordHasher_1 = require("../utils/passwordHasher");
/**
 * Create a new account (generic - works for any role)
 */
var createAccount = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var existingAccount, hashedPassword, account;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.account.findUnique({
                    where: { email: data.email.toLowerCase().trim() },
                })];
            case 1:
                existingAccount = _a.sent();
                if (existingAccount) {
                    throw new Error("Account with this email already exists");
                }
                return [4 /*yield*/, (0, passwordHasher_1.hashPassword)(data.password)];
            case 2:
                hashedPassword = _a.sent();
                return [4 /*yield*/, db_1.prisma.account.create({
                        data: {
                            email: data.email.toLowerCase().trim(),
                            password: hashedPassword,
                            firstName: data.firstName.trim(),
                            lastName: data.lastName.trim(),
                            phone: data.phone,
                            role: data.role,
                            status: "active",
                            isEmailVerified: data.role === "User" ? false : true,
                        },
                    })];
            case 3:
                account = _a.sent();
                return [2 /*return*/, account];
        }
    });
}); };
exports.createAccount = createAccount;
/**
 * Create ChurchAdmin account + profile (1:1 with Church)
 */
var createChurchAdmin = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var church, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.church.findUnique({
                    where: { id: data.churchId },
                    include: { churchAdmin: true },
                })];
            case 1:
                church = _a.sent();
                if (!church) {
                    throw new Error("Church not found");
                }
                if (church.churchAdmin) {
                    throw new Error("This church already has an assigned Church Admin. Exactly 1 Church Admin per church is allowed (1:1 relationship).");
                }
                return [4 /*yield*/, db_1.prisma.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        var account, churchAdmin;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, (0, exports.createAccount)(data)];
                                case 1:
                                    account = _a.sent();
                                    return [4 /*yield*/, tx.churchAdmin.create({
                                            data: {
                                                accountId: account.id,
                                                churchId: data.churchId,
                                                title: data.title || null,
                                            },
                                        })];
                                case 2:
                                    churchAdmin = _a.sent();
                                    return [2 /*return*/, { account: account, churchAdmin: churchAdmin }];
                            }
                        });
                    }); })];
            case 2:
                result = _a.sent();
                if (!(church.status === "pending")) return [3 /*break*/, 4];
                return [4 /*yield*/, (0, churchService_1.activateChurch)(data.churchId)];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4: return [2 /*return*/, result];
        }
    });
}); };
exports.createChurchAdmin = createChurchAdmin;
/**
 * Create Counselor account + profile
 */
var createCounselor = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var church, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.church.findUnique({
                    where: { id: data.churchId },
                })];
            case 1:
                church = _a.sent();
                if (!church) {
                    throw new Error("Church not found");
                }
                return [4 /*yield*/, db_1.prisma.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        var account, counselor;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, (0, exports.createAccount)(data)];
                                case 1:
                                    account = _a.sent();
                                    return [4 /*yield*/, tx.counselor.create({
                                            data: {
                                                accountId: account.id,
                                                churchId: data.churchId,
                                                bio: data.bio,
                                            },
                                        })];
                                case 2:
                                    counselor = _a.sent();
                                    return [2 /*return*/, { account: account, counselor: counselor }];
                            }
                        });
                    }); })];
            case 2:
                result = _a.sent();
                return [2 /*return*/, result];
        }
    });
}); };
exports.createCounselor = createCounselor;
/**
 * Update account status
 */
var updateAccountStatus = function (accountId, status) { return __awaiter(void 0, void 0, void 0, function () {
    var account;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.account.update({
                    where: { id: accountId },
                    data: { status: status },
                })];
            case 1:
                account = _a.sent();
                return [2 /*return*/, account];
        }
    });
}); };
exports.updateAccountStatus = updateAccountStatus;
/**
 * Change password
 */
var changePassword = function (accountId, currentPassword, newPassword) { return __awaiter(void 0, void 0, void 0, function () {
    var account, bcrypt, isMatch, hashedPassword;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.account.findUnique({
                    where: { id: accountId },
                })];
            case 1:
                account = _a.sent();
                if (!account || !account.password) {
                    throw new Error("Account not found or password not set");
                }
                return [4 /*yield*/, Promise.resolve().then(function () { return require("bcryptjs"); })];
            case 2:
                bcrypt = _a.sent();
                return [4 /*yield*/, bcrypt.compare(currentPassword, account.password)];
            case 3:
                isMatch = _a.sent();
                if (!isMatch) {
                    throw new Error("Current password is incorrect");
                }
                return [4 /*yield*/, (0, passwordHasher_1.hashPassword)(newPassword)];
            case 4:
                hashedPassword = _a.sent();
                return [4 /*yield*/, db_1.prisma.account.update({
                        where: { id: accountId },
                        data: { password: hashedPassword },
                    })];
            case 5:
                _a.sent();
                return [2 /*return*/, { message: "Password changed successfully" }];
        }
    });
}); };
exports.changePassword = changePassword;
