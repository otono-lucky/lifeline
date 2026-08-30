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
exports.cancel = exports.decline = exports.accept = exports.getReceived = exports.getSent = exports.sendRequest = void 0;
var requestService_1 = require("../services/requestService");
var sendRequest = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var senderAccountId, receiverUserId, result, error_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                senderAccountId = (_a = req.account) === null || _a === void 0 ? void 0 : _a.id;
                receiverUserId = req.body.receiverUserId;
                if (!senderAccountId) {
                    return [2 /*return*/, res.status(401).json({ success: false, message: "Unauthorized" })];
                }
                if (!receiverUserId) {
                    return [2 /*return*/, res.status(400).json({ success: false, message: "receiverUserId is required" })];
                }
                return [4 /*yield*/, (0, requestService_1.sendMatchRequest)(senderAccountId, receiverUserId)];
            case 1:
                result = _b.sent();
                return [2 /*return*/, res.status(201).json({
                        success: true,
                        message: "Match request sent successfully",
                        data: result,
                        errors: null,
                    })];
            case 2:
                error_1 = _b.sent();
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        message: error_1.message || "Failed to send match request",
                        errors: error_1.message,
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.sendRequest = sendRequest;
var getSent = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var accountId, result, error_2;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                accountId = (_a = req.account) === null || _a === void 0 ? void 0 : _a.id;
                if (!accountId) {
                    return [2 /*return*/, res.status(401).json({ success: false, message: "Unauthorized" })];
                }
                return [4 /*yield*/, (0, requestService_1.getSentMatchRequests)(accountId)];
            case 1:
                result = _b.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        message: "Sent match requests retrieved",
                        data: result,
                        errors: null,
                    })];
            case 2:
                error_2 = _b.sent();
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        message: error_2.message || "Failed to fetch sent requests",
                        errors: error_2.message,
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getSent = getSent;
var getReceived = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var accountId, result, error_3;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                accountId = (_a = req.account) === null || _a === void 0 ? void 0 : _a.id;
                if (!accountId) {
                    return [2 /*return*/, res.status(401).json({ success: false, message: "Unauthorized" })];
                }
                return [4 /*yield*/, (0, requestService_1.getReceivedMatchRequests)(accountId)];
            case 1:
                result = _b.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        message: "Received match requests retrieved",
                        data: result,
                        errors: null,
                    })];
            case 2:
                error_3 = _b.sent();
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        message: error_3.message || "Failed to fetch received requests",
                        errors: error_3.message,
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getReceived = getReceived;
var accept = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var accountId, id, result, error_4;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                accountId = (_a = req.account) === null || _a === void 0 ? void 0 : _a.id;
                id = req.params.id;
                if (!accountId) {
                    return [2 /*return*/, res.status(401).json({ success: false, message: "Unauthorized" })];
                }
                return [4 /*yield*/, (0, requestService_1.acceptMatchRequest)(accountId, id)];
            case 1:
                result = _b.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        message: result.message,
                        data: result.data,
                        errors: null,
                    })];
            case 2:
                error_4 = _b.sent();
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        message: error_4.message || "Failed to accept match request",
                        errors: error_4.message,
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.accept = accept;
var decline = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var accountId, id, result, error_5;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                accountId = (_a = req.account) === null || _a === void 0 ? void 0 : _a.id;
                id = req.params.id;
                if (!accountId) {
                    return [2 /*return*/, res.status(401).json({ success: false, message: "Unauthorized" })];
                }
                return [4 /*yield*/, (0, requestService_1.declineMatchRequest)(accountId, id)];
            case 1:
                result = _b.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        message: result.message,
                        data: null,
                        errors: null,
                    })];
            case 2:
                error_5 = _b.sent();
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        message: error_5.message || "Failed to decline match request",
                        errors: error_5.message,
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.decline = decline;
var cancel = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var accountId, id, result, error_6;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                accountId = (_a = req.account) === null || _a === void 0 ? void 0 : _a.id;
                id = req.params.id;
                if (!accountId) {
                    return [2 /*return*/, res.status(401).json({ success: false, message: "Unauthorized" })];
                }
                return [4 /*yield*/, (0, requestService_1.cancelMatchRequest)(accountId, id)];
            case 1:
                result = _b.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        message: result.message,
                        data: null,
                        errors: null,
                    })];
            case 2:
                error_6 = _b.sent();
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        message: error_6.message || "Failed to cancel match request",
                        errors: error_6.message,
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.cancel = cancel;
