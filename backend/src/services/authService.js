"use strict";
// services/authService.ts
// Authentication & Lead Retention Service
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
exports.resendVerificationEmail = exports.resetPassword = exports.requestPasswordReset = exports.verifyEmail = exports.requestEmailVerification = exports.createUserAccountWithVerification = exports.handleSocialAuth = exports.registerLead = void 0;
var bcryptjs_1 = require("bcryptjs");
var crypto_1 = require("crypto");
var db_1 = require("../config/db");
var emailService_1 = require("../services/emailService");
var env_1 = require("../config/env");
/**
 * Step 1 Lead Capture (Strategic Onboarding & Lead Retention Framework)
 */
var registerLead = function (input) { return __awaiter(void 0, void 0, void 0, function () {
    var existing, hashedPassword, salt, account;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.account.findUnique({
                    where: { email: input.email.toLowerCase().trim() },
                })];
            case 1:
                existing = _a.sent();
                if (existing) {
                    throw new Error("An account with this email already exists");
                }
                hashedPassword = null;
                if (!input.password) return [3 /*break*/, 4];
                return [4 /*yield*/, bcryptjs_1.default.genSalt(10)];
            case 2:
                salt = _a.sent();
                return [4 /*yield*/, bcryptjs_1.default.hash(input.password, salt)];
            case 3:
                hashedPassword = _a.sent();
                _a.label = 4;
            case 4: return [4 /*yield*/, db_1.prisma.account.create({
                    data: {
                        email: input.email.toLowerCase().trim(),
                        phone: input.phone || null,
                        firstName: input.firstName.trim(),
                        lastName: input.lastName.trim(),
                        password: hashedPassword,
                        authProvider: input.authProvider || "local",
                        authProviderId: input.authProviderId || null,
                        role: "User",
                        isEmailVerified: input.authProvider ? true : false,
                        status: "pending",
                        user: {
                            create: {
                                gender: input.gender || "Male",
                                onboardingStep: 1,
                                profileCompletionPercentage: 10,
                                vettingStatus: "DRAFT",
                                isDiscoveryIndexed: false,
                            },
                        },
                    },
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                        status: true,
                        isEmailVerified: true,
                        createdAt: true,
                    },
                })];
            case 5:
                account = _a.sent();
                return [2 /*return*/, account];
        }
    });
}); };
exports.registerLead = registerLead;
/**
 * Social Auth One-Click Integration (Google, Apple, etc.)
 */
var handleSocialAuth = function (input) { return __awaiter(void 0, void 0, void 0, function () {
    var account;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.account.findUnique({
                    where: { email: input.email.toLowerCase().trim() },
                    include: { user: true },
                })];
            case 1:
                account = _a.sent();
                if (!!account) return [3 /*break*/, 3];
                return [4 /*yield*/, db_1.prisma.account.create({
                        data: {
                            email: input.email.toLowerCase().trim(),
                            firstName: input.firstName,
                            lastName: input.lastName,
                            authProvider: input.provider,
                            authProviderId: input.providerId,
                            role: "User",
                            isEmailVerified: true,
                            status: "active",
                            user: {
                                create: {
                                    gender: input.gender || "Male",
                                    onboardingStep: 1,
                                    profileCompletionPercentage: 15,
                                    vettingStatus: "DRAFT",
                                    isDiscoveryIndexed: false,
                                },
                            },
                        },
                        include: { user: true },
                    })];
            case 2:
                // Auto-create lead account
                account = _a.sent();
                return [3 /*break*/, 5];
            case 3:
                if (!!account.authProviderId) return [3 /*break*/, 5];
                return [4 /*yield*/, db_1.prisma.account.update({
                        where: { id: account.id },
                        data: {
                            authProvider: input.provider,
                            authProviderId: input.providerId,
                            isEmailVerified: true,
                        },
                        include: { user: true },
                    })];
            case 4:
                // Link social provider to existing account
                account = _a.sent();
                _a.label = 5;
            case 5: return [2 /*return*/, account];
        }
    });
}); };
exports.handleSocialAuth = handleSocialAuth;
var createUserAccountWithVerification = function (input) { return __awaiter(void 0, void 0, void 0, function () {
    var startedAt, newAccount, emailSent, emailPreview, emailErrorMessage, emailStart, emailResult, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                startedAt = Date.now();
                console.log("[authService] Creating account");
                return [4 /*yield*/, db_1.prisma.account.create({
                        data: {
                            firstName: input.firstName,
                            lastName: input.lastName,
                            email: input.email.toLowerCase().trim(),
                            phone: input.phone,
                            password: input.hashedPassword,
                            role: "User",
                            isEmailVerified: false,
                            user: {
                                create: {
                                    gender: input.gender,
                                    dateOfBirth: input.dateOfBirth
                                        ? new Date(input.dateOfBirth)
                                        : undefined,
                                    originCountry: input.originCountry,
                                    originState: input.originState,
                                    originLga: input.originLga,
                                    residenceCountry: input.residenceCountry,
                                    residenceState: input.residenceState,
                                    residenceCity: input.residenceCity,
                                    residenceAddress: input.residenceAddress,
                                    occupation: input.occupation,
                                    interests: input.interests,
                                    churchId: input.churchId,
                                    branchName: input.branchName,
                                    whatsappNumber: input.whatsappNumber || input.phone,
                                    matchPreference: input.matchPreference,
                                    vettingStatus: "DRAFT",
                                    profileCompletionPercentage: 50,
                                },
                            },
                        },
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            role: true,
                            isEmailVerified: true,
                            status: true,
                            createdAt: true,
                        },
                    })];
            case 1:
                newAccount = _a.sent();
                console.log("[authService] Account created in ".concat(Date.now() - startedAt, "ms"));
                emailSent = true;
                emailPreview = null;
                emailErrorMessage = null;
                emailStart = Date.now();
                console.log("[authService] Sending verification email");
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, (0, exports.requestEmailVerification)(newAccount)];
            case 3:
                emailResult = _a.sent();
                emailPreview = (emailResult === null || emailResult === void 0 ? void 0 : emailResult.emailPreview) || null;
                console.log("[authService] Verification email sent in ".concat(Date.now() - emailStart, "ms"));
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                emailSent = false;
                emailErrorMessage = (error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || String(error_1);
                console.error("[authService] Verification email failed after ".concat(Date.now() - emailStart, "ms:"), emailErrorMessage);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/, {
                    account: newAccount,
                    emailSent: emailSent,
                    emailPreview: emailPreview,
                    emailErrorMessage: emailErrorMessage,
                }];
        }
    });
}); };
exports.createUserAccountWithVerification = createUserAccountWithVerification;
/**
 * Request email verification
 */
var requestEmailVerification = function (partialAccount) { return __awaiter(void 0, void 0, void 0, function () {
    var token, hashedToken, expiry, account, verificationUrl, emailHtml, shouldUseTestEmail, emailMessage, shouldReturnPreview;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!partialAccount.id || !partialAccount.email) {
                    throw new Error("Account ID or Email not found");
                }
                token = crypto_1.default.randomBytes(32).toString("hex");
                hashedToken = crypto_1.default.createHash("sha256").update(token).digest("hex");
                expiry = new Date();
                expiry.setHours(expiry.getHours() + 24); // 24 hours
                return [4 /*yield*/, db_1.prisma.account.update({
                        where: { id: partialAccount.id },
                        data: {
                            emailVerificationToken: hashedToken,
                            emailVerificationExpiry: expiry,
                            emailVerificationLastSentAt: new Date(),
                        },
                    })];
            case 1:
                account = _a.sent();
                verificationUrl = "".concat(env_1.default.clientUrl, "/email-confirmation?token=").concat(token);
                emailHtml = "\n      <h2>Welcome ".concat(account.firstName, "!</h2>\n      <p>Please verify your email address by clicking the link below:</p>\n      <a href=\"").concat(verificationUrl, "\">Verify Email</a>\n      <p>This link expires in 24 hours.</p>\n      <p>If you didn't create an account, please ignore this email.</p>\n    ");
                shouldUseTestEmail = env_1.default.mailtrap.useSandbox || env_1.default.exposeEmailHtml;
                emailMessage = null;
                if (!shouldUseTestEmail) return [3 /*break*/, 3];
                return [4 /*yield*/, (0, emailService_1.sendTestEmail)({
                        to: account.email,
                        subject: "Verify Your Email - Lifeline Dating Platform",
                        html: emailHtml,
                    })];
            case 2:
                emailMessage = _a.sent();
                return [3 /*break*/, 5];
            case 3: return [4 /*yield*/, (0, emailService_1.sendEmail)({
                    to: account.email,
                    subject: "Verify Your Email - Lifeline Dating Platform",
                    html: emailHtml,
                })];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5:
                shouldReturnPreview = shouldUseTestEmail;
                return [2 /*return*/, {
                        message: "Verification email sent",
                        verificationUrl: verificationUrl,
                        emailPreview: shouldReturnPreview
                            ? {
                                html: emailMessage || emailHtml,
                                verificationUrl: verificationUrl,
                            }
                            : null,
                    }];
        }
    });
}); };
exports.requestEmailVerification = requestEmailVerification;
/**
 * Verify email with token
 */
var verifyEmail = function (token) { return __awaiter(void 0, void 0, void 0, function () {
    var hashedToken, account;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                hashedToken = crypto_1.default.createHash("sha256").update(token).digest("hex");
                return [4 /*yield*/, db_1.prisma.account.findUnique({
                        where: { emailVerificationToken: hashedToken },
                    })];
            case 1:
                account = _a.sent();
                if (!account) {
                    throw new Error("Invalid verification token");
                }
                if (!account.emailVerificationToken || !account.emailVerificationExpiry) {
                    throw new Error("Invalid or missing verification token");
                }
                if (new Date() > account.emailVerificationExpiry) {
                    throw new Error("Verification token has expired");
                }
                // Mark email as verified
                return [4 /*yield*/, db_1.prisma.account.update({
                        where: { id: account.id },
                        data: {
                            isEmailVerified: true,
                            status: "active",
                            emailVerificationToken: null,
                            emailVerificationExpiry: null,
                            emailVerificationLastSentAt: null,
                        },
                    })];
            case 2:
                // Mark email as verified
                _a.sent();
                return [2 /*return*/, {
                        message: "Email verified successfully",
                        account: {
                            id: account.id,
                            email: account.email,
                            firstName: account.firstName,
                        },
                    }];
        }
    });
}); };
exports.verifyEmail = verifyEmail;
/**
 * Request password reset
 */
var requestPasswordReset = function (email) { return __awaiter(void 0, void 0, void 0, function () {
    var account, token, expiry, resetUrl, emailHtml, shouldUseTestEmail, emailMessage, shouldReturnPreview;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.account.findUnique({
                    where: { email: email },
                })];
            case 1:
                account = _a.sent();
                if (!account) {
                    return [2 /*return*/, {
                            message: "If an account exists, a password reset link has been sent",
                        }];
                }
                token = crypto_1.default.randomBytes(32).toString("hex");
                expiry = new Date();
                expiry.setMinutes(expiry.getMinutes() + 15); // 15 minutes
                return [4 /*yield*/, db_1.prisma.account.update({
                        where: { id: account.id },
                        data: {
                            passwordResetToken: token,
                            passwordResetExpiry: expiry,
                        },
                    })];
            case 2:
                _a.sent();
                resetUrl = "".concat(env_1.default.clientUrl, "/reset-password?token=").concat(token);
                emailHtml = "\n      <h2>Password Reset Request</h2>\n      <p>Hi ".concat(account.firstName, ",</p>\n      <p>You requested to reset your password. Click the link below:</p>\n      <a href=\"").concat(resetUrl, "\">").concat(resetUrl, "</a>\n      <p>This link expires in 15 minutes.</p>\n      <p>If you didn't request this, please ignore this email.</p>\n    ");
                shouldUseTestEmail = env_1.default.mailtrap.useSandbox || env_1.default.exposeEmailHtml;
                emailMessage = null;
                if (!shouldUseTestEmail) return [3 /*break*/, 4];
                return [4 /*yield*/, (0, emailService_1.sendTestEmail)({
                        to: account.email,
                        subject: "Reset Your Password - Faith Dating Platform",
                        html: emailHtml,
                    })];
            case 3:
                emailMessage = _a.sent();
                return [3 /*break*/, 6];
            case 4: return [4 /*yield*/, (0, emailService_1.sendEmail)({
                    to: account.email,
                    subject: "Reset Your Password - Faith Dating Platform",
                    html: emailHtml,
                })];
            case 5:
                _a.sent();
                _a.label = 6;
            case 6:
                shouldReturnPreview = shouldUseTestEmail;
                return [2 /*return*/, {
                        message: "If an account exists, a password reset link has been sent",
                        emailPreview: shouldReturnPreview
                            ? {
                                html: emailMessage || emailHtml,
                                resetUrl: resetUrl,
                            }
                            : null,
                    }];
        }
    });
}); };
exports.requestPasswordReset = requestPasswordReset;
/**
 * Reset password with token
 */
var resetPassword = function (token, newPassword) { return __awaiter(void 0, void 0, void 0, function () {
    var account, salt, hashedPassword;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.account.findUnique({
                    where: { passwordResetToken: token },
                })];
            case 1:
                account = _a.sent();
                if (!account) {
                    throw new Error("Invalid reset token");
                }
                if (account.passwordResetExpiry && new Date() > account.passwordResetExpiry) {
                    throw new Error("Reset token has expired");
                }
                return [4 /*yield*/, bcryptjs_1.default.genSalt(10)];
            case 2:
                salt = _a.sent();
                return [4 /*yield*/, bcryptjs_1.default.hash(newPassword, salt)];
            case 3:
                hashedPassword = _a.sent();
                return [4 /*yield*/, db_1.prisma.account.update({
                        where: { id: account.id },
                        data: {
                            password: hashedPassword,
                            passwordResetToken: null,
                            passwordResetExpiry: null,
                        },
                    })];
            case 4:
                _a.sent();
                return [2 /*return*/, {
                        message: "Password reset successfully",
                    }];
        }
    });
}); };
exports.resetPassword = resetPassword;
/**
 * Resend verification email
 */
var resendVerificationEmail = function (email) { return __awaiter(void 0, void 0, void 0, function () {
    var account, now, cooldownMs, diffMs, remainingMs, remainingSeconds, minutes, seconds, human, error;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.account.findUnique({
                    where: { email: email },
                })];
            case 1:
                account = _a.sent();
                if (!account) {
                    throw new Error("Account not found");
                }
                if (account.isEmailVerified) {
                    throw new Error("Email already verified");
                }
                now = new Date();
                cooldownMs = 2 * 60 * 1000;
                if (account.emailVerificationLastSentAt) {
                    diffMs = now.getTime() - account.emailVerificationLastSentAt.getTime();
                    if (diffMs < cooldownMs) {
                        remainingMs = cooldownMs - diffMs;
                        remainingSeconds = Math.ceil(remainingMs / 1000);
                        minutes = Math.floor(remainingSeconds / 60);
                        seconds = remainingSeconds % 60;
                        human = minutes > 0 ? "".concat(minutes, "m ").concat(seconds, "s") : "".concat(seconds, "s");
                        error = new Error("Please wait ".concat(human, " before requesting another verification email."));
                        error.retryAfterSeconds = remainingSeconds;
                        throw error;
                    }
                }
                return [4 /*yield*/, (0, exports.requestEmailVerification)(account)];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.resendVerificationEmail = resendVerificationEmail;
