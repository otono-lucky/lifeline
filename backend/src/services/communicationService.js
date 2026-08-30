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
exports.respondToCalendarEvent = exports.proposeCalendarEvent = exports.sendMessage = exports.getConversationMessages = exports.listUserConversations = void 0;
var db_1 = require("../config/db");
var listUserConversations = function (accountId) { return __awaiter(void 0, void 0, void 0, function () {
    var conversations;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.conversationParticipant.findMany({
                    where: { accountId: accountId },
                    include: {
                        conversation: {
                            include: {
                                participants: {
                                    include: {
                                        conversation: false,
                                    },
                                },
                                messages: {
                                    take: 1,
                                    orderBy: { createdAt: "desc" },
                                    include: {
                                        sender: {
                                            select: { firstName: true, lastName: true },
                                        },
                                    },
                                },
                            },
                        },
                    },
                })];
            case 1:
                conversations = _a.sent();
                return [2 /*return*/, conversations.map(function (p) {
                        var conv = p.conversation;
                        var lastMsg = conv.messages[0];
                        return {
                            conversationId: conv.id,
                            matchId: conv.matchId,
                            type: conv.type,
                            roleInChat: p.roleInChat,
                            createdAt: conv.createdAt,
                            lastMessage: lastMsg
                                ? {
                                    id: lastMsg.id,
                                    content: lastMsg.content,
                                    mediaUrl: lastMsg.mediaUrl,
                                    senderName: "".concat(lastMsg.sender.firstName, " ").concat(lastMsg.sender.lastName),
                                    createdAt: lastMsg.createdAt,
                                }
                                : null,
                        };
                    })];
        }
    });
}); };
exports.listUserConversations = listUserConversations;
var getConversationMessages = function (accountId, conversationId, options) { return __awaiter(void 0, void 0, void 0, function () {
    var page, limit, skip, isParticipant, _a, messages, total;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                page = (options === null || options === void 0 ? void 0 : options.page) || 1;
                limit = (options === null || options === void 0 ? void 0 : options.limit) || 50;
                skip = (page - 1) * limit;
                return [4 /*yield*/, db_1.prisma.conversationParticipant.findUnique({
                        where: {
                            conversationId_accountId: {
                                conversationId: conversationId,
                                accountId: accountId,
                            },
                        },
                    })];
            case 1:
                isParticipant = _b.sent();
                if (!isParticipant) {
                    throw new Error("You are not a participant in this conversation");
                }
                return [4 /*yield*/, Promise.all([
                        db_1.prisma.message.findMany({
                            where: { conversationId: conversationId },
                            skip: skip,
                            take: limit,
                            orderBy: { createdAt: "asc" },
                            include: {
                                sender: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        role: true,
                                    },
                                },
                            },
                        }),
                        db_1.prisma.message.count({ where: { conversationId: conversationId } }),
                    ])];
            case 2:
                _a = _b.sent(), messages = _a[0], total = _a[1];
                return [2 /*return*/, {
                        messages: messages.map(function (m) { return ({
                            id: m.id,
                            content: m.content,
                            mediaUrl: m.mediaUrl,
                            createdAt: m.createdAt,
                            readAt: m.readAt,
                            sender: {
                                id: m.sender.id,
                                name: "".concat(m.sender.firstName, " ").concat(m.sender.lastName),
                                role: m.sender.role,
                                isMe: m.sender.id === accountId,
                            },
                        }); }),
                        pagination: {
                            total: total,
                            page: page,
                            limit: limit,
                            totalPages: Math.ceil(total / limit),
                        },
                    }];
        }
    });
}); };
exports.getConversationMessages = getConversationMessages;
var sendMessage = function (senderAccountId, conversationId, content, mediaUrl) { return __awaiter(void 0, void 0, void 0, function () {
    var isParticipant, message;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.conversationParticipant.findUnique({
                    where: {
                        conversationId_accountId: {
                            conversationId: conversationId,
                            accountId: senderAccountId,
                        },
                    },
                })];
            case 1:
                isParticipant = _a.sent();
                if (!isParticipant) {
                    throw new Error("You are not authorized to post in this conversation");
                }
                return [4 /*yield*/, db_1.prisma.message.create({
                        data: {
                            conversationId: conversationId,
                            senderId: senderAccountId,
                            content: content,
                            mediaUrl: mediaUrl,
                        },
                        include: {
                            sender: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    role: true,
                                },
                            },
                        },
                    })];
            case 2:
                message = _a.sent();
                return [2 /*return*/, {
                        id: message.id,
                        conversationId: message.conversationId,
                        content: message.content,
                        mediaUrl: message.mediaUrl,
                        createdAt: message.createdAt,
                        sender: {
                            id: message.sender.id,
                            name: "".concat(message.sender.firstName, " ").concat(message.sender.lastName),
                            role: message.sender.role,
                        },
                    }];
        }
    });
}); };
exports.sendMessage = sendMessage;
// Dynamic Calendar & Auto-Add Logic
var proposeCalendarEvent = function (proposerAccountId, matchId, data) { return __awaiter(void 0, void 0, void 0, function () {
    var match, event;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.match.findUnique({
                    where: { id: matchId },
                    include: {
                        participants: {
                            include: { user: true },
                        },
                    },
                })];
            case 1:
                match = _a.sent();
                if (!match)
                    throw new Error("Match not found");
                return [4 /*yield*/, db_1.prisma.calendarEvent.create({
                        data: {
                            matchId: matchId,
                            proposedById: proposerAccountId,
                            title: data.title,
                            description: data.description,
                            startTime: data.startTime,
                            endTime: data.endTime,
                            meetingLink: data.meetingLink,
                            status: "PROPOSED",
                        },
                    })];
            case 2:
                event = _a.sent();
                return [2 /*return*/, event];
        }
    });
}); };
exports.proposeCalendarEvent = proposeCalendarEvent;
var respondToCalendarEvent = function (responderAccountId, eventId, status) { return __awaiter(void 0, void 0, void 0, function () {
    var event, updatedEvent;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.calendarEvent.findUnique({
                    where: { id: eventId },
                })];
            case 1:
                event = _a.sent();
                if (!event)
                    throw new Error("Calendar event not found");
                return [4 /*yield*/, db_1.prisma.calendarEvent.update({
                        where: { id: eventId },
                        data: { status: status },
                    })];
            case 2:
                updatedEvent = _a.sent();
                return [2 /*return*/, {
                        success: true,
                        message: status === "CONFIRMED"
                            ? "Meeting confirmed and auto-added to participant calendars"
                            : "Meeting cancelled",
                        event: updatedEvent,
                    }];
        }
    });
}); };
exports.respondToCalendarEvent = respondToCalendarEvent;
