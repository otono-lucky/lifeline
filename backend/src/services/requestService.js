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
exports.acceptMatchRequest = exports.cancelMatchRequest = exports.declineMatchRequest = exports.getReceivedMatchRequests = exports.getSentMatchRequests = exports.sendMatchRequest = void 0;
var db_1 = require("../config/db");
var constants_1 = require("../constants");
var emailService_1 = require("./emailService");
var sendMatchRequest = function (senderAccountId, receiverUserId) { return __awaiter(void 0, void 0, void 0, function () {
    var sender, receiver, existingRequest, createdRequest, slotsUsed, slotsRemaining;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.user.findUnique({
                    where: { accountId: senderAccountId },
                    include: {
                        sentRequests: {
                            where: { status: "PENDING" },
                        },
                    },
                })];
            case 1:
                sender = _a.sent();
                if (!sender) {
                    throw new Error("Sender user profile not found");
                }
                if (sender.vettingStatus !== "VETTED_ACTIVE" || !sender.isDiscoveryIndexed) {
                    throw new Error("You must be an active, vetted member in discovery to send match requests");
                }
                // 1. Enforce 3 active slots constraint
                if (sender.sentRequests.length >= constants_1.MAX_ACTIVE_REQUEST_SLOTS) {
                    throw new Error("Request limit reached: You can only have up to ".concat(constants_1.MAX_ACTIVE_REQUEST_SLOTS, " active requests at a time. Please wait for an outcome or cancel an existing request."));
                }
                if (sender.id === receiverUserId) {
                    throw new Error("You cannot send a match request to yourself");
                }
                return [4 /*yield*/, db_1.prisma.user.findUnique({
                        where: { id: receiverUserId },
                        include: {
                            account: { select: { status: true, firstName: true } },
                        },
                    })];
            case 2:
                receiver = _a.sent();
                if (!receiver || receiver.account.status !== "active") {
                    throw new Error("Target prospect is not available");
                }
                if (receiver.gender === sender.gender) {
                    throw new Error("Match requests must be sent to the opposite gender");
                }
                if (receiver.vettingStatus !== "VETTED_ACTIVE" || !receiver.isDiscoveryIndexed) {
                    throw new Error("Target prospect is currently not active in discovery");
                }
                return [4 /*yield*/, db_1.prisma.matchRequest.findFirst({
                        where: {
                            OR: [
                                { senderId: sender.id, receiverId: receiver.id },
                                { senderId: receiver.id, receiverId: sender.id },
                            ],
                            status: { in: ["PENDING", "ACCEPTED"] },
                        },
                    })];
            case 3:
                existingRequest = _a.sent();
                if (existingRequest) {
                    throw new Error("An active request or match already exists with this person");
                }
                return [4 /*yield*/, db_1.prisma.matchRequest.create({
                        data: {
                            senderId: sender.id,
                            receiverId: receiver.id,
                            status: "PENDING",
                        },
                        include: {
                            receiver: {
                                include: {
                                    account: {
                                        select: { firstName: true, lastName: true },
                                    },
                                },
                            },
                        },
                    })];
            case 4:
                createdRequest = _a.sent();
                slotsUsed = sender.sentRequests.length + 1;
                slotsRemaining = constants_1.MAX_ACTIVE_REQUEST_SLOTS - slotsUsed;
                return [2 /*return*/, {
                        requestId: createdRequest.id,
                        status: createdRequest.status,
                        slotsUsed: slotsUsed,
                        slotsRemaining: slotsRemaining,
                        createdAt: createdRequest.createdAt,
                    }];
        }
    });
}); };
exports.sendMatchRequest = sendMatchRequest;
var getSentMatchRequests = function (accountId) { return __awaiter(void 0, void 0, void 0, function () {
    var user, requests, pendingCount;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.user.findUnique({
                    where: { accountId: accountId },
                    select: { id: true },
                })];
            case 1:
                user = _a.sent();
                if (!user)
                    throw new Error("User not found");
                return [4 /*yield*/, db_1.prisma.matchRequest.findMany({
                        where: { senderId: user.id },
                        orderBy: { createdAt: "desc" },
                        include: {
                            receiver: {
                                include: {
                                    account: {
                                        select: { firstName: true, lastName: true },
                                    },
                                    photos: {
                                        where: { order: 1 },
                                        select: { url: true },
                                    },
                                    church: {
                                        select: { officialName: true },
                                    },
                                },
                            },
                        },
                    })];
            case 2:
                requests = _a.sent();
                pendingCount = requests.filter(function (r) { return r.status === "PENDING"; }).length;
                return [2 /*return*/, {
                        slotsTotal: constants_1.MAX_ACTIVE_REQUEST_SLOTS,
                        slotsUsed: pendingCount,
                        slotsRemaining: constants_1.MAX_ACTIVE_REQUEST_SLOTS - pendingCount,
                        requests: requests.map(function (r) {
                            var _a, _b;
                            return ({
                                id: r.id,
                                status: r.status,
                                createdAt: r.createdAt,
                                // Blind rejection: never reveal receiver identity on non-active requests
                                receiver: r.status === "PENDING" || r.status === "ACCEPTED"
                                    ? {
                                        userId: r.receiver.id,
                                        firstName: r.receiver.account.firstName,
                                        lastNameInitial: r.receiver.account.lastName
                                            ? r.receiver.account.lastName.charAt(0) + "."
                                            : "",
                                        photoUrl: ((_a = r.receiver.photos[0]) === null || _a === void 0 ? void 0 : _a.url) || null,
                                        church: ((_b = r.receiver.church) === null || _b === void 0 ? void 0 : _b.officialName) || null,
                                    }
                                    : null,
                            });
                        }),
                    }];
        }
    });
}); };
exports.getSentMatchRequests = getSentMatchRequests;
var getReceivedMatchRequests = function (accountId) { return __awaiter(void 0, void 0, void 0, function () {
    var user, requests;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.user.findUnique({
                    where: { accountId: accountId },
                    select: { id: true },
                })];
            case 1:
                user = _a.sent();
                if (!user)
                    throw new Error("User not found");
                return [4 /*yield*/, db_1.prisma.matchRequest.findMany({
                        where: {
                            receiverId: user.id,
                            status: "PENDING",
                        },
                        orderBy: { createdAt: "desc" },
                        include: {
                            sender: {
                                include: {
                                    account: {
                                        select: { firstName: true, lastName: true },
                                    },
                                    photos: {
                                        orderBy: { order: "asc" },
                                        select: { url: true },
                                    },
                                    church: {
                                        select: { officialName: true, state: true, city: true },
                                    },
                                },
                            },
                        },
                    })];
            case 2:
                requests = _a.sent();
                return [2 /*return*/, requests.map(function (r) {
                        var _a;
                        return ({
                            id: r.id,
                            createdAt: r.createdAt,
                            sender: {
                                userId: r.sender.id,
                                firstName: r.sender.account.firstName,
                                lastNameInitial: r.sender.account.lastName
                                    ? r.sender.account.lastName.charAt(0) + "."
                                    : "",
                                occupation: r.sender.occupation,
                                interests: r.sender.interests,
                                residenceState: r.sender.residenceState,
                                residenceCity: r.sender.residenceCity,
                                photos: r.sender.photos.map(function (p) { return p.url; }),
                                videoIntroUrl: r.sender.videoIntroUrl,
                                church: ((_a = r.sender.church) === null || _a === void 0 ? void 0 : _a.officialName) || null,
                            },
                        });
                    })];
        }
    });
}); };
exports.getReceivedMatchRequests = getReceivedMatchRequests;
// Blind Rejection (Psychological Safety)
var declineMatchRequest = function (receiverAccountId, requestId) { return __awaiter(void 0, void 0, void 0, function () {
    var receiver, request, requestWithSender, slotsRemaining;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, db_1.prisma.user.findUnique({
                    where: { accountId: receiverAccountId },
                    select: { id: true },
                })];
            case 1:
                receiver = _c.sent();
                if (!receiver)
                    throw new Error("User not found");
                return [4 /*yield*/, db_1.prisma.matchRequest.findUnique({
                        where: { id: requestId },
                    })];
            case 2:
                request = _c.sent();
                if (!request || request.receiverId !== receiver.id) {
                    throw new Error("Match request not found");
                }
                if (request.status !== "PENDING") {
                    throw new Error("This request is no longer pending");
                }
                return [4 /*yield*/, db_1.prisma.matchRequest.update({
                        where: { id: requestId },
                        data: {
                            status: "DECLINED",
                            declinedAt: new Date(),
                        },
                    })];
            case 3:
                _c.sent();
                return [4 /*yield*/, db_1.prisma.matchRequest.findUnique({
                        where: { id: requestId },
                        include: {
                            sender: {
                                include: {
                                    sentRequests: { where: { status: "PENDING" } },
                                    account: { select: { email: true, firstName: true } },
                                },
                            },
                        },
                    })];
            case 4:
                requestWithSender = _c.sent();
                if ((_b = (_a = requestWithSender === null || requestWithSender === void 0 ? void 0 : requestWithSender.sender) === null || _a === void 0 ? void 0 : _a.account) === null || _b === void 0 ? void 0 : _b.email) {
                    slotsRemaining = constants_1.MAX_ACTIVE_REQUEST_SLOTS - requestWithSender.sender.sentRequests.length;
                    (0, emailService_1.sendEmail)({
                        to: requestWithSender.sender.account.email,
                        subject: "Lifeline — A request slot is now available",
                        html: "<p>Hi ".concat(requestWithSender.sender.account.firstName, ",</p>\n<p>One of your match requests has been resolved and you now have <strong>").concat(slotsRemaining, " slot").concat(slotsRemaining !== 1 ? "s" : "", "</strong> available.</p>\n<p>Head back to the app to explore new connections.</p>\n<p>\u2014 The Lifeline Team</p>"),
                    }).catch(function (err) {
                        return console.error("[requestService] Blind decline email failed:", err === null || err === void 0 ? void 0 : err.message);
                    });
                }
                return [2 /*return*/, {
                        success: true,
                        message: "Request declined",
                    }];
        }
    });
}); };
exports.declineMatchRequest = declineMatchRequest;
var cancelMatchRequest = function (senderAccountId, requestId) { return __awaiter(void 0, void 0, void 0, function () {
    var sender, request;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.user.findUnique({
                    where: { accountId: senderAccountId },
                    select: { id: true },
                })];
            case 1:
                sender = _a.sent();
                if (!sender)
                    throw new Error("User not found");
                return [4 /*yield*/, db_1.prisma.matchRequest.findUnique({
                        where: { id: requestId },
                    })];
            case 2:
                request = _a.sent();
                if (!request || request.senderId !== sender.id) {
                    throw new Error("Match request not found");
                }
                if (request.status !== "PENDING") {
                    throw new Error("This request is no longer pending");
                }
                return [4 /*yield*/, db_1.prisma.matchRequest.update({
                        where: { id: requestId },
                        data: {
                            status: "CANCELLED",
                        },
                    })];
            case 3:
                _a.sent();
                return [2 /*return*/, {
                        success: true,
                        message: "Request cancelled and slot reclaimed",
                    }];
        }
    });
}); };
exports.cancelMatchRequest = cancelMatchRequest;
// First-Come Acceptance Concurrency Resolution
var acceptMatchRequest = function (receiverAccountId, requestId) { return __awaiter(void 0, void 0, void 0, function () {
    var receiver, request, sender, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.user.findUnique({
                    where: { accountId: receiverAccountId },
                    include: {
                        assignedCounselor: { select: { id: true, accountId: true } },
                    },
                })];
            case 1:
                receiver = _a.sent();
                if (!receiver)
                    throw new Error("Receiver user profile not found");
                return [4 /*yield*/, db_1.prisma.matchRequest.findUnique({
                        where: { id: requestId },
                        include: {
                            sender: {
                                include: {
                                    assignedCounselor: { select: { id: true, accountId: true } },
                                },
                            },
                        },
                    })];
            case 2:
                request = _a.sent();
                if (!request || request.receiverId !== receiver.id) {
                    throw new Error("Match request not found");
                }
                if (request.status !== "PENDING") {
                    throw new Error("This request is no longer available or was superseded");
                }
                sender = request.sender;
                return [4 /*yield*/, db_1.prisma.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        var acceptedRequest, match, coupleConversation, groupParticipants, counselorConversation;
                        var _a, _b, _c;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0: return [4 /*yield*/, tx.matchRequest.update({
                                        where: { id: requestId },
                                        data: { status: "ACCEPTED" },
                                    })];
                                case 1:
                                    acceptedRequest = _d.sent();
                                    return [4 /*yield*/, tx.match.create({
                                            data: {
                                                status: "IN_CONVERSATION",
                                                counselorId: receiver.assignedCounselorId || sender.assignedCounselorId || null,
                                            },
                                        })];
                                case 2:
                                    match = _d.sent();
                                    // 3. Create MatchParticipants
                                    return [4 /*yield*/, tx.matchParticipant.createMany({
                                            data: [
                                                { matchId: match.id, userId: sender.id },
                                                { matchId: match.id, userId: receiver.id },
                                            ],
                                        })];
                                case 3:
                                    // 3. Create MatchParticipants
                                    _d.sent();
                                    // 4. Auto-cancel / Supersede all other pending requests involving either party
                                    return [4 /*yield*/, tx.matchRequest.updateMany({
                                            where: {
                                                id: { not: requestId },
                                                status: "PENDING",
                                                OR: [
                                                    { senderId: sender.id },
                                                    { receiverId: sender.id },
                                                    { senderId: receiver.id },
                                                    { receiverId: receiver.id },
                                                ],
                                            },
                                            data: {
                                                status: "SUPERSEDED",
                                                supersededAt: new Date(),
                                            },
                                        })];
                                case 4:
                                    // 4. Auto-cancel / Supersede all other pending requests involving either party
                                    _d.sent();
                                    // 5. Exit discovery pool for both users while actively matched
                                    return [4 /*yield*/, tx.user.update({
                                            where: { id: sender.id },
                                            data: { isDiscoveryIndexed: false },
                                        })];
                                case 5:
                                    // 5. Exit discovery pool for both users while actively matched
                                    _d.sent();
                                    return [4 /*yield*/, tx.user.update({
                                            where: { id: receiver.id },
                                            data: { isDiscoveryIndexed: false },
                                        })];
                                case 6:
                                    _d.sent();
                                    return [4 /*yield*/, tx.conversation.create({
                                            data: {
                                                matchId: match.id,
                                                type: "COUPLE_PRIVATE",
                                                participants: {
                                                    create: [
                                                        { accountId: sender.accountId, roleInChat: "COUPLE_MEMBER" },
                                                        { accountId: receiver.accountId, roleInChat: "COUPLE_MEMBER" },
                                                    ],
                                                },
                                            },
                                        })];
                                case 7:
                                    coupleConversation = _d.sent();
                                    groupParticipants = [
                                        { accountId: sender.accountId, roleInChat: "COUPLE_MEMBER" },
                                        { accountId: receiver.accountId, roleInChat: "COUPLE_MEMBER" },
                                    ];
                                    if ((_a = sender.assignedCounselor) === null || _a === void 0 ? void 0 : _a.accountId) {
                                        groupParticipants.push({
                                            accountId: sender.assignedCounselor.accountId,
                                            roleInChat: "COUNSELOR",
                                        });
                                    }
                                    if (((_b = receiver.assignedCounselor) === null || _b === void 0 ? void 0 : _b.accountId) &&
                                        receiver.assignedCounselor.accountId !== ((_c = sender.assignedCounselor) === null || _c === void 0 ? void 0 : _c.accountId)) {
                                        groupParticipants.push({
                                            accountId: receiver.assignedCounselor.accountId,
                                            roleInChat: "COUNSELOR",
                                        });
                                    }
                                    return [4 /*yield*/, tx.conversation.create({
                                            data: {
                                                matchId: match.id,
                                                type: "COUNSELOR_GROUP",
                                                participants: {
                                                    create: groupParticipants,
                                                },
                                            },
                                        })];
                                case 8:
                                    counselorConversation = _d.sent();
                                    return [2 /*return*/, {
                                            matchId: match.id,
                                            coupleConversationId: coupleConversation.id,
                                            counselorConversationId: counselorConversation.id,
                                        }];
                            }
                        });
                    }); })];
            case 3:
                result = _a.sent();
                return [2 /*return*/, {
                        success: true,
                        message: "Match request accepted! Private and Counselor channels have been initialized.",
                        data: result,
                    }];
        }
    });
}); };
exports.acceptMatchRequest = acceptMatchRequest;
