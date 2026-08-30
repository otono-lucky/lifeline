"use strict";
// controllers/auth.controller.ts
// Complete authentication & lead retention endpoints
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.resetPasswordWithToken = exports.forgotPassword = exports.verifyEmailToken = exports.requestVerification = exports.login = exports.signup = exports.socialLogin = exports.leadRegister = void 0;
var db_1 = require("../config/db");
var tokenManager_1 = require("../utils/tokenManager");
var authService_1 = require("../services/authService");
var responseHandler_1 = require("../utils/responseHandler");
var passwordHasher_1 = require("../utils/passwordHasher");
/**
 * @desc    Step-1 Lead Registration (Strategic Onboarding & Lead Recovery)
 * @route   POST /api/auth/lead-register
 * @access  Public
 */
var leadRegister = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, phone, firstName, lastName, password, authProvider, authProviderId, gender, account, token, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, email = _a.email, phone = _a.phone, firstName = _a.firstName, lastName = _a.lastName, password = _a.password, authProvider = _a.authProvider, authProviderId = _a.authProviderId, gender = _a.gender;
                if (!email || !firstName || !lastName) {
                    return [2 /*return*/, res.status(400).json((0, responseHandler_1.errorResponse)("Email, firstName, and lastName are required"))];
                }
                return [4 /*yield*/, (0, authService_1.registerLead)({
                        email: email,
                        phone: phone,
                        firstName: firstName,
                        lastName: lastName,
                        password: password,
                        authProvider: authProvider,
                        authProviderId: authProviderId,
                        gender: gender,
                    })];
            case 1:
                account = _b.sent();
                token = (0, tokenManager_1.generateToken)({
                    id: account.id,
                    email: account.email,
                    role: account.role,
                    firstName: account.firstName,
                });
                return [2 /*return*/, res.status(201).json((0, responseHandler_1.successResponse)("Lead registered successfully. Initializing onboarding sequence.", {
                        token: token,
                        account: account,
                    }))];
            case 2:
                error_1 = _b.sent();
                return [2 /*return*/, res.status(400).json((0, responseHandler_1.errorResponse)(error_1.message || "Failed to register lead"))];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.leadRegister = leadRegister;
/**
 * @desc    One-Click Social Login / Register (Google, Apple, etc.)
 * @route   POST /api/auth/social-login
 * @access  Public
 */
var socialLogin = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, provider, providerId, email, firstName, lastName, gender, account, token, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, provider = _a.provider, providerId = _a.providerId, email = _a.email, firstName = _a.firstName, lastName = _a.lastName, gender = _a.gender;
                if (!provider || !providerId || !email) {
                    return [2 /*return*/, res.status(400).json((0, responseHandler_1.errorResponse)("Provider, providerId, and email are required"))];
                }
                return [4 /*yield*/, (0, authService_1.handleSocialAuth)({
                        provider: provider,
                        providerId: providerId,
                        email: email,
                        firstName: firstName || "User",
                        lastName: lastName || "",
                        gender: gender,
                    })];
            case 1:
                account = _b.sent();
                token = (0, tokenManager_1.generateToken)({
                    id: account.id,
                    email: account.email,
                    role: account.role,
                    firstName: account.firstName,
                });
                return [2 /*return*/, res.json((0, responseHandler_1.successResponse)("Social login successful", {
                        token: token,
                        user: {
                            id: account.id,
                            firstName: account.firstName,
                            lastName: account.lastName,
                            email: account.email,
                            role: account.role,
                        },
                    }))];
            case 2:
                error_2 = _b.sent();
                return [2 /*return*/, res.status(400).json((0, responseHandler_1.errorResponse)(error_2.message || "Social login failed"))];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.socialLogin = socialLogin;
/**
 * @desc    Register new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
var signup = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var requestId, startedAt, _a, firstName, lastName, email, phone, password, gender, dateOfBirth, originCountry, originState, originLga, residenceCountry, residenceState, residenceCity, residenceAddress, occupation, interests, churchId, matchPreference, branchName, whatsappNumber, existingUser, hashedPassword, _b, newAccount, emailSent, emailPreview, emailErrorMessage, message, error_3;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                requestId = "signup_".concat(Date.now().toString(36), "_").concat(Math.random()
                    .toString(36)
                    .slice(2, 6));
                startedAt = Date.now();
                console.log("[POST /api/auth/signup][".concat(requestId, "] Starting - Email:"), (_c = req.body) === null || _c === void 0 ? void 0 : _c.email);
                _d.label = 1;
            case 1:
                _d.trys.push([1, 5, , 6]);
                _a = req.body, firstName = _a.firstName, lastName = _a.lastName, email = _a.email, phone = _a.phone, password = _a.password, gender = _a.gender, dateOfBirth = _a.dateOfBirth, originCountry = _a.originCountry, originState = _a.originState, originLga = _a.originLga, residenceCountry = _a.residenceCountry, residenceState = _a.residenceState, residenceCity = _a.residenceCity, residenceAddress = _a.residenceAddress, occupation = _a.occupation, interests = _a.interests, churchId = _a.churchId, matchPreference = _a.matchPreference, branchName = _a.branchName, whatsappNumber = _a.whatsappNumber;
                return [4 /*yield*/, db_1.prisma.account.findUnique({
                        where: { email: email },
                    })];
            case 2:
                existingUser = _d.sent();
                if (existingUser) {
                    console.error("[POST /api/auth/signup][".concat(requestId, "] Failed: User already exists"));
                    return [2 /*return*/, res.status(400).json((0, responseHandler_1.errorResponse)("User already exists"))];
                }
                return [4 /*yield*/, (0, passwordHasher_1.hashPassword)(password)];
            case 3:
                hashedPassword = _d.sent();
                return [4 /*yield*/, (0, authService_1.createUserAccountWithVerification)({
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        phone: phone,
                        hashedPassword: hashedPassword,
                        gender: gender,
                        dateOfBirth: dateOfBirth,
                        originCountry: originCountry,
                        originState: originState,
                        originLga: originLga,
                        residenceCountry: residenceCountry,
                        residenceState: residenceState,
                        residenceCity: residenceCity,
                        residenceAddress: residenceAddress,
                        occupation: occupation,
                        interests: interests,
                        churchId: churchId,
                        matchPreference: matchPreference,
                        branchName: branchName,
                        whatsappNumber: whatsappNumber,
                    })];
            case 4:
                _b = _d.sent(), newAccount = _b.account, emailSent = _b.emailSent, emailPreview = _b.emailPreview, emailErrorMessage = _b.emailErrorMessage;
                if (!emailSent) {
                    console.error("[POST /api/auth/signup][".concat(requestId, "] Verification email failed:"), emailErrorMessage || "Unknown error");
                }
                console.log("[POST /api/auth/signup][".concat(requestId, "] Success - User: ").concat(newAccount.id, " in ").concat(Date.now() - startedAt, "ms"));
                message = emailSent
                    ? "User registered successfully. Please check your email to verify your account."
                    : "User registered successfully, but we could not send a verification email. Please request verification.";
                res.status(201).json((0, responseHandler_1.successResponse)(message, __assign({ user: newAccount, emailSent: emailSent }, (emailPreview ? { emailPreview: emailPreview } : {}))));
                return [3 /*break*/, 6];
            case 5:
                error_3 = _d.sent();
                console.error("[POST /api/auth/signup][".concat(requestId, "] Failed after ").concat(Date.now() - startedAt, "ms:"), error_3.message);
                res
                    .status(500)
                    .json((0, responseHandler_1.errorResponse)(error_3.message || "Server error during registration"));
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.signup = signup;
/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
var login = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, userAccount, isMatch, token, error_4;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                console.log("[POST /api/auth/login] Starting - Email:", (_b = req.body) === null || _b === void 0 ? void 0 : _b.email);
                _c.label = 1;
            case 1:
                _c.trys.push([1, 4, , 5]);
                _a = req.body, email = _a.email, password = _a.password;
                return [4 /*yield*/, db_1.prisma.account.findUnique({
                        where: { email: email },
                    })];
            case 2:
                userAccount = _c.sent();
                if (!userAccount || !userAccount.password) {
                    console.error("[POST /api/auth/login] Failed: Invalid credentials");
                    return [2 /*return*/, res.status(400).json((0, responseHandler_1.errorResponse)("Invalid email or password"))];
                }
                return [4 /*yield*/, (0, passwordHasher_1.comparePassword)(password, userAccount.password)];
            case 3:
                isMatch = _c.sent();
                if (!isMatch) {
                    console.error("[POST /api/auth/login] Failed: Invalid credentials - password mismatch");
                    return [2 /*return*/, res.status(400).json((0, responseHandler_1.errorResponse)("Invalid email or password"))];
                }
                if (userAccount.status === "suspended") {
                    return [2 /*return*/, res
                            .status(403)
                            .json((0, responseHandler_1.errorResponse)("Your account has been suspended. Please contact support."))];
                }
                if (userAccount.role === "User" && !userAccount.isEmailVerified) {
                    return [2 /*return*/, res.status(403).json((0, responseHandler_1.errorResponse)("Please verify your email address before logging in. Check your inbox for the verification link.", {
                            requiresVerification: true,
                            email: userAccount.email,
                        }))];
                }
                token = (0, tokenManager_1.generateToken)({
                    id: userAccount.id,
                    email: userAccount.email,
                    role: userAccount.role,
                    firstName: userAccount.firstName,
                });
                console.log("[POST /api/auth/login] Success - User:", userAccount.id);
                res.json((0, responseHandler_1.successResponse)("Logged in successfully", {
                    token: token,
                    user: {
                        id: userAccount.id,
                        firstName: userAccount.firstName,
                        lastName: userAccount.lastName,
                        email: userAccount.email,
                        role: userAccount.role,
                        isEmailVerified: userAccount.isEmailVerified,
                    },
                }));
                return [3 /*break*/, 5];
            case 4:
                error_4 = _c.sent();
                console.error("[POST /api/auth/login] Failed:", error_4.message);
                res
                    .status(500)
                    .json((0, responseHandler_1.errorResponse)("Server error during login"));
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.login = login;
/**
 * @desc    Request email verification
 * @route   POST /api/auth/request-verification
 * @access  Public
 */
var requestVerification = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var email, result, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                email = req.body.email;
                if (!email) {
                    return [2 /*return*/, res.status(400).json((0, responseHandler_1.errorResponse)("Email is required"))];
                }
                return [4 /*yield*/, (0, authService_1.resendVerificationEmail)(email)];
            case 1:
                result = _a.sent();
                res.json((0, responseHandler_1.successResponse)(result.message || "Verification email sent. Please check your inbox.", __assign({}, (result.emailPreview ? { emailPreview: result.emailPreview } : {}))));
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                if (error_5 === null || error_5 === void 0 ? void 0 : error_5.retryAfterSeconds) {
                    return [2 /*return*/, res.status(429).json((0, responseHandler_1.errorResponse)(error_5.message, {
                            retryAfterSeconds: error_5.retryAfterSeconds,
                        }))];
                }
                res.status(500).json((0, responseHandler_1.errorResponse)(error_5.message || "Server error sending verification email"));
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.requestVerification = requestVerification;
/**
 * @desc    Verify email with token
 * @route   GET /api/auth/verify-email/:token
 * @access  Public
 */
var verifyEmailToken = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var token, result, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                token = String(req.params.token);
                return [4 /*yield*/, (0, authService_1.verifyEmail)(token)];
            case 1:
                result = _a.sent();
                res.json((0, responseHandler_1.successResponse)(result.message, { account: result.account }));
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                res
                    .status(400)
                    .json((0, responseHandler_1.errorResponse)(error_6.message || "Server error verifying email"));
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.verifyEmailToken = verifyEmailToken;
/**
 * @desc    Request password reset
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
var forgotPassword = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var email, result, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                email = req.body.email;
                if (!email) {
                    return [2 /*return*/, res.status(400).json((0, responseHandler_1.errorResponse)("Email is required"))];
                }
                return [4 /*yield*/, (0, authService_1.requestPasswordReset)(email)];
            case 1:
                result = _a.sent();
                res.json((0, responseHandler_1.successResponse)(result.message, __assign({}, (result.emailPreview ? { emailPreview: result.emailPreview } : {}))));
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                res
                    .status(500)
                    .json((0, responseHandler_1.errorResponse)(error_7.message || "Server error processing password reset request"));
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.forgotPassword = forgotPassword;
/**
 * @desc    Reset password with token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
var resetPasswordWithToken = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, token, password, confirmPassword, result, error_8;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, token = _a.token, password = _a.password, confirmPassword = _a.confirmPassword;
                if (!token || !password || !confirmPassword) {
                    return [2 /*return*/, res
                            .status(400)
                            .json((0, responseHandler_1.errorResponse)("Token, password, and confirmPassword are required"))];
                }
                if (password !== confirmPassword) {
                    return [2 /*return*/, res.status(400).json((0, responseHandler_1.errorResponse)("Passwords do not match"))];
                }
                if (password.length < 6) {
                    return [2 /*return*/, res
                            .status(400)
                            .json((0, responseHandler_1.errorResponse)("Password must be at least 6 characters long"))];
                }
                return [4 /*yield*/, (0, authService_1.resetPassword)(token, password)];
            case 1:
                result = _b.sent();
                res.json((0, responseHandler_1.successResponse)(result.message, null));
                return [3 /*break*/, 3];
            case 2:
                error_8 = _b.sent();
                res
                    .status(400)
                    .json((0, responseHandler_1.errorResponse)(error_8.message || "Server error resetting password"));
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.resetPasswordWithToken = resetPasswordWithToken;
/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
var getCurrentUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var account, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.prisma.account.findUnique({
                        where: { id: req.account.id },
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            phone: true,
                            role: true,
                            isEmailVerified: true,
                            status: true,
                            createdAt: true,
                            churchAdmin: {
                                select: {
                                    title: true,
                                    churchId: true,
                                },
                            },
                        },
                    })];
            case 1:
                account = _a.sent();
                if (!account) {
                    return [2 /*return*/, res.status(404).json((0, responseHandler_1.errorResponse)("Account not found"))];
                }
                res.json((0, responseHandler_1.successResponse)("User fetched successfully", { user: account }));
                return [3 /*break*/, 3];
            case 2:
                error_9 = _a.sent();
                res
                    .status(500)
                    .json((0, responseHandler_1.errorResponse)(error_9.message || "Server error fetching user"));
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getCurrentUser = getCurrentUser;
