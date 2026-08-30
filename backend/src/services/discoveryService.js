"use strict";
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
exports.getDiscoveryFeed = exports.calculateHaversineDistanceKm = void 0;
var db_1 = require("../config/db");
var ageUtils_1 = require("../utils/ageUtils");
// Haversine formula to compute great-circle distance between two points in km
var calculateHaversineDistanceKm = function (lat1, lon1, lat2, lon2) {
    var R = 6371; // Earth's radius in km
    var dLat = ((lat2 - lat1) * Math.PI) / 180;
    var dLon = ((lon2 - lon1) * Math.PI) / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
exports.calculateHaversineDistanceKm = calculateHaversineDistanceKm;
var getDiscoveryFeed = function (viewerAccountId, options) { return __awaiter(void 0, void 0, void 0, function () {
    var page, limit, skip, viewer, excludedUserIds, targetGender, churchWhere, candidateUsers, viewerLat, viewerLng, scoredCandidates, paginatedCandidates;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                page = (options === null || options === void 0 ? void 0 : options.page) || 1;
                limit = (options === null || options === void 0 ? void 0 : options.limit) || 20;
                skip = (page - 1) * limit;
                return [4 /*yield*/, db_1.prisma.user.findUnique({
                        where: { accountId: viewerAccountId },
                        include: {
                            account: { select: { id: true, firstName: true, role: true } },
                            church: { select: { id: true, officialName: true } },
                            sentRequests: {
                                where: { status: { in: ["PENDING", "ACCEPTED"] } },
                                select: { receiverId: true },
                            },
                            matchParticipations: {
                                select: {
                                    match: {
                                        select: {
                                            participants: {
                                                select: { userId: true },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    })];
            case 1:
                viewer = _a.sent();
                if (!viewer) {
                    throw new Error("Viewer not found");
                }
                excludedUserIds = new Set([viewer.id]);
                viewer.sentRequests.forEach(function (req) { return excludedUserIds.add(req.receiverId); });
                viewer.matchParticipations.forEach(function (p) {
                    p.match.participants.forEach(function (part) { return excludedUserIds.add(part.userId); });
                });
                targetGender = viewer.gender === "Male" ? "Female" : "Male";
                churchWhere = {};
                if (viewer.matchPreference === "my_church" && viewer.churchId) {
                    churchWhere.churchId = viewer.churchId;
                }
                else if (viewer.matchPreference === "other_churches" && viewer.churchId) {
                    churchWhere.churchId = { not: viewer.churchId };
                }
                return [4 /*yield*/, db_1.prisma.user.findMany({
                        where: __assign({ id: { notIn: Array.from(excludedUserIds) }, gender: targetGender, vettingStatus: "VETTED_ACTIVE", isDiscoveryIndexed: true, account: {
                                role: "User",
                                status: "active",
                            } }, churchWhere),
                        include: {
                            account: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                            church: {
                                select: {
                                    id: true,
                                    officialName: true,
                                    aka: true,
                                    state: true,
                                    city: true,
                                },
                            },
                            photos: {
                                orderBy: { order: "asc" },
                                select: { url: true, order: true },
                            },
                        },
                    })];
            case 2:
                candidateUsers = _a.sent();
                viewerLat = viewer.residenceLatitude;
                viewerLng = viewer.residenceLongitude;
                scoredCandidates = candidateUsers
                    .map(function (candidate) {
                    var candidateAge = (0, ageUtils_1.calculateAge)(candidate.dateOfBirth);
                    // Filter by age if provided
                    if ((options === null || options === void 0 ? void 0 : options.minAge) && candidateAge && candidateAge < options.minAge) {
                        return null;
                    }
                    if ((options === null || options === void 0 ? void 0 : options.maxAge) && candidateAge && candidateAge > options.maxAge) {
                        return null;
                    }
                    var distanceKm = null;
                    if (viewerLat != null &&
                        viewerLng != null &&
                        candidate.residenceLatitude != null &&
                        candidate.residenceLongitude != null) {
                        distanceKm = (0, exports.calculateHaversineDistanceKm)(viewerLat, viewerLng, candidate.residenceLatitude, candidate.residenceLongitude);
                    }
                    if ((options === null || options === void 0 ? void 0 : options.maxDistanceKm) &&
                        distanceKm != null &&
                        distanceKm > options.maxDistanceKm) {
                        return null;
                    }
                    // Proximity Score (1.0 for exact location, decaying with distance)
                    var proximityScore = distanceKm != null ? 1 / (1 + distanceKm / 10) : 0.5;
                    // Same-Church Affinity Bonus
                    var sameChurchBonus = viewer.churchId && candidate.churchId === viewer.churchId ? 0.3 : 0;
                    var totalScore = proximityScore + sameChurchBonus;
                    return {
                        userId: candidate.id,
                        firstName: candidate.account.firstName,
                        lastNameInitial: candidate.account.lastName
                            ? candidate.account.lastName.charAt(0) + "."
                            : "",
                        age: candidateAge,
                        gender: candidate.gender,
                        occupation: candidate.occupation,
                        interests: candidate.interests,
                        matchPreference: candidate.matchPreference,
                        originState: candidate.originState,
                        residenceState: candidate.residenceState,
                        residenceCity: candidate.residenceCity,
                        distanceKm: distanceKm != null ? Math.round(distanceKm * 10) / 10 : null,
                        church: candidate.church
                            ? {
                                id: candidate.church.id,
                                name: candidate.church.officialName,
                                aka: candidate.church.aka,
                                city: candidate.church.city,
                                state: candidate.church.state,
                            }
                            : null,
                        branchName: candidate.branchName,
                        photos: candidate.photos.map(function (p) { return p.url; }),
                        videoIntroUrl: candidate.videoIntroUrl,
                        score: totalScore,
                    };
                })
                    .filter(function (c) { return c !== null; });
                // Sort candidates by highest match score descending
                scoredCandidates.sort(function (a, b) { return b.score - a.score; });
                paginatedCandidates = scoredCandidates.slice(skip, skip + limit);
                return [2 /*return*/, {
                        candidates: paginatedCandidates,
                        pagination: {
                            total: scoredCandidates.length,
                            page: page,
                            limit: limit,
                            totalPages: Math.ceil(scoredCandidates.length / limit),
                        },
                    }];
        }
    });
}); };
exports.getDiscoveryFeed = getDiscoveryFeed;
