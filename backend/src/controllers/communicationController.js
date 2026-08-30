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
exports.respondEvent = exports.proposeEvent = exports.postMessage = exports.getMessages = exports.getConversations = void 0;
var communicationService_1 = require("../services/communicationService");
var getConversations = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var accountId, result, error_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                accountId = (_a = req.account) === null || _a === void 0 ? void 0 : _a.id;
                if (!accountId) {
                    return [2 /*return*/, res.status(401).json({ success: false, message: "Unauthorized" })];
                }
                return [4 /*yield*/, (0, communicationService_1.listUserConversations)(accountId)];
            case 1:
                result = _b.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        message: "Conversations retrieved",
                        data: result,
                        errors: null,
                    })];
            case 2:
                error_1 = _b.sent();
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        message: error_1.message || "Failed to fetch conversations",
                        errors: error_1.message,
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getConversations = getConversations;
var getMessages = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var accountId, conversationId, _a, page, limit, result, error_2;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                accountId = (_b = req.account) === null || _b === void 0 ? void 0 : _b.id;
                conversationId = req.params.conversationId;
                _a = req.query, page = _a.page, limit = _a.limit;
                if (!accountId) {
                    return [2 /*return*/, res.status(401).json({ success: false, message: "Unauthorized" })];
                }
                return [4 /*yield*/, (0, communicationService_1.getConversationMessages)(accountId, conversationId, {
                        page: page ? parseInt(page, 10) : 1,
                        limit: limit ? parseInt(limit, 10) : 50,
                    })];
            case 1:
                result = _c.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        message: "Messages retrieved",
                        data: result.messages,
                        pagination: result.pagination,
                        errors: null,
                    })];
            case 2:
                error_2 = _c.sent();
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        message: error_2.message || "Failed to fetch messages",
                        errors: error_2.message,
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getMessages = getMessages;
var postMessage = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var accountId, conversationId, _a, content, mediaUrl, result, error_3;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                accountId = (_b = req.account) === null || _b === void 0 ? void 0 : _b.id;
                conversationId = req.params.conversationId;
                _a = req.body, content = _a.content, mediaUrl = _a.mediaUrl;
                if (!accountId) {
                    return [2 /*return*/, res.status(401).json({ success: false, message: "Unauthorized" })];
                }
                if (!content && !mediaUrl) {
                    return [2 /*return*/, res.status(400).json({ success: false, message: "Message content or media is required" })];
                }
                return [4 /*yield*/, (0, communicationService_1.sendMessage)(accountId, conversationId, content || "", mediaUrl)];
            case 1:
                result = _c.sent();
                return [2 /*return*/, res.status(201).json({
                        success: true,
                        message: "Message sent",
                        data: result,
                        errors: null,
                    })];
            case 2:
                error_3 = _c.sent();
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        message: error_3.message || "Failed to send message",
                        errors: error_3.message,
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.postMessage = postMessage;
var proposeEvent = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var accountId, matchId, _a, title, description, startTime, endTime, meetingLink, event_1, error_4;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                accountId = (_b = req.account) === null || _b === void 0 ? void 0 : _b.id;
                matchId = req.params.matchId;
                _a = req.body, title = _a.title, description = _a.description, startTime = _a.startTime, endTime = _a.endTime, meetingLink = _a.meetingLink;
                if (!accountId) {
                    return [2 /*return*/, res.status(401).json({ success: false, message: "Unauthorized" })];
                }
                if (!title || !startTime || !endTime) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Title, startTime, and endTime are required",
                        })];
                }
                return [4 /*yield*/, (0, communicationService_1.proposeCalendarEvent)(accountId, matchId, {
                        title: title,
                        description: description,
                        startTime: new Date(startTime),
                        endTime: new Date(endTime),
                        meetingLink: meetingLink,
                    })];
            case 1:
                event_1 = _c.sent();
                return [2 /*return*/, res.status(201).json({
                        success: true,
                        message: "Calendar event proposed",
                        data: event_1,
                        errors: null,
                    })];
            case 2:
                error_4 = _c.sent();
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        message: error_4.message || "Failed to propose calendar event",
                        errors: error_4.message,
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.proposeEvent = proposeEvent;
var respondEvent = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var accountId, eventId, status_1, result, error_5;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                accountId = (_a = req.account) === null || _a === void 0 ? void 0 : _a.id;
                eventId = req.params.eventId;
                status_1 = req.body.status;
                if (!accountId) {
                    return [2 /*return*/, res.status(401).json({ success: false, message: "Unauthorized" })];
                }
                if (!["CONFIRMED", "CANCELLED"].includes(status_1)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Status must be CONFIRMED or CANCELLED",
                        })];
                }
                return [4 /*yield*/, (0, communicationService_1.respondToCalendarEvent)(accountId, eventId, status_1)];
            case 1:
                result = _b.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        message: result.message,
                        data: result.event,
                        errors: null,
                    })];
            case 2:
                error_5 = _b.sent();
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        message: error_5.message || "Failed to respond to calendar event",
                        errors: error_5.message,
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.respondEvent = respondEvent;
