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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACTIVE_MATCH_STATUSES = exports.findRandomCounselorId = exports.listMatches = exports.getMatchPublicProfileForMatch = exports.getMatchPublicProfile = exports.getMatchById = exports.getMatchHistoryForUser = exports.getActiveMatchForUser = exports.createManualMatch = exports.getMatchingEligibility = exports.getProfileCompletionStatus = void 0;
var db_1 = require("../config/db");
var ageUtils_1 = require("../utils/ageUtils");
var ACTIVE_MATCH_STATUSES = [
    "IN_CONVERSATION",
    "COURTSHIP",
];
exports.ACTIVE_MATCH_STATUSES = ACTIVE_MATCH_STATUSES;
var ELEVATED_ROLES = ["SuperAdmin", "ChurchAdmin", "Counselor"];
var isElevatedRole = function (role) {
    return Boolean(role && ELEVATED_ROLES.includes(role));
};
var getUserByAccountId = function (accountId) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.user.findUnique({
                    where: { accountId: accountId },
                    include: {
                        account: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                        socialMediaHandles: {
                            select: {
                                id: true,
                                platform: true,
                                handleOrUrl: true,
                                createdAt: true,
                            },
                            orderBy: { createdAt: "desc" },
                        },
                        church: {
                            select: {
                                id: true,
                                officialName: true,
                                aka: true,
                            },
                        },
                    },
                })];
            case 1:
                user = _a.sent();
                if (!user) {
                    throw new Error("User not found");
                }
                return [2 /*return*/, user];
        }
    });
}); };
var hasActiveMatch = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    var active;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.matchParticipant.findFirst({
                    where: {
                        userId: userId,
                        match: {
                            status: { in: ACTIVE_MATCH_STATUSES },
                        },
                    },
                    select: { id: true },
                })];
            case 1:
                active = _a.sent();
                return [2 /*return*/, Boolean(active)];
        }
    });
}); };
var MIN_SOCIALS = 2;
var MAX_SOCIALS = 4;
var MIN_INTERESTS = 3;
var isNonEmptyString = function (value) {
    return typeof value === "string" && value.trim().length > 0;
};
var getInterestsCount = function (value) {
    return Array.isArray(value) ? value.length : 0;
};
var getProfileCompletionReasons = function (user) {
    var handleCount = user.socialMediaHandles.length;
    var interestsCount = getInterestsCount(user.interests);
    return __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], (isNonEmptyString(user.profilePictureUrl)
        ? []
        : ["Profile picture is required"]), true), (isNonEmptyString(user.videoIntroUrl)
        ? []
        : ["Video introduction is required"]), true), (isNonEmptyString(user.occupation) ? [] : ["Occupation is required"]), true), (user.matchPreference ? [] : ["Match preference is required"]), true), (user.dateOfBirth ? [] : ["Date of birth is required"]), true), (user.gender ? [] : ["Gender is required"]), true), (interestsCount >= MIN_INTERESTS
        ? []
        : ["At least ".concat(MIN_INTERESTS, " interests are required")]), true), (isNonEmptyString(user.originCountry) &&
        isNonEmptyString(user.originState) &&
        isNonEmptyString(user.originLga)
        ? []
        : ["Origin location is required"]), true), (isNonEmptyString(user.residenceCountry) &&
        isNonEmptyString(user.residenceState) &&
        isNonEmptyString(user.residenceCity) &&
        isNonEmptyString(user.residenceAddress)
        ? []
        : ["Residence location is required"]), true), (handleCount >= MIN_SOCIALS
        ? []
        : ["User must have at least ".concat(MIN_SOCIALS, " social media handles")]), true), (handleCount <= MAX_SOCIALS
        ? []
        : ["User cannot have more than ".concat(MAX_SOCIALS, " social media handles")]), true);
};
var getProfileCompletionStatus = function (user) {
    var reasons = getProfileCompletionReasons(user);
    return {
        isComplete: reasons.length === 0,
        reasons: reasons,
    };
};
exports.getProfileCompletionStatus = getProfileCompletionStatus;
var getEligibilityFromUser = function (user) {
    var reasons = user.isVerified
        ? []
        : ["User must be verified by a counselor or admin"];
    return {
        isEligible: reasons.length === 0,
        reasons: reasons,
    };
};
var getMatchingEligibility = function (accountId) { return __awaiter(void 0, void 0, void 0, function () {
    var user, eligibility;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.user.findUnique({
                    where: { accountId: accountId },
                    select: {
                        id: true,
                        isVerified: true,
                        matchParticipations: {
                            where: {
                                match: {
                                    status: { in: ACTIVE_MATCH_STATUSES },
                                },
                            },
                            select: { id: true },
                            take: 1,
                        },
                    },
                })];
            case 1:
                user = _a.sent();
                if (!user) {
                    throw new Error("User not found");
                }
                eligibility = getEligibilityFromUser(user);
                return [2 /*return*/, __assign(__assign({}, eligibility), { hasActiveMatch: user.matchParticipations.length > 0 })];
        }
    });
}); };
exports.getMatchingEligibility = getMatchingEligibility;
var createManualMatch = function (requesterAccountId, accountIdA, accountIdB) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, requester, userA, userB, _b, maleUser, femaleUser, _c, maleEligibility, femaleEligibility, match;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                if (accountIdA === accountIdB) {
                    throw new Error("A match must include two distinct users");
                }
                return [4 /*yield*/, Promise.all([
                        db_1.prisma.account.findUnique({
                            where: { id: requesterAccountId },
                            include: {
                                counselor: { select: { id: true } },
                                churchAdmin: { select: { id: true } },
                                superAdmin: { select: { id: true } },
                            },
                        }),
                        getUserByAccountId(accountIdA),
                        getUserByAccountId(accountIdB),
                    ])];
            case 1:
                _a = _d.sent(), requester = _a[0], userA = _a[1], userB = _a[2];
                if (!requester) {
                    throw new Error("Requester not found");
                }
                if (!requester.counselor && !requester.churchAdmin && !requester.superAdmin) {
                    throw new Error("You are not allowed to create matches");
                }
                if (userA.gender === userB.gender) {
                    throw new Error("Match requires users of different genders");
                }
                _b = userA.gender === "Male" ? [userA, userB] : [userB, userA], maleUser = _b[0], femaleUser = _b[1];
                return [4 /*yield*/, Promise.all([
                        (0, exports.getMatchingEligibility)(maleUser.account.id),
                        (0, exports.getMatchingEligibility)(femaleUser.account.id),
                    ])];
            case 2:
                _c = _d.sent(), maleEligibility = _c[0], femaleEligibility = _c[1];
                if (!maleEligibility.isEligible) {
                    throw new Error("Male user is not eligible: ".concat(maleEligibility.reasons.join(", ")));
                }
                if (!femaleEligibility.isEligible) {
                    throw new Error("Female user is not eligible: ".concat(femaleEligibility.reasons.join(", ")));
                }
                if (maleEligibility.hasActiveMatch || femaleEligibility.hasActiveMatch) {
                    throw new Error("One or both users already have an active match");
                }
                return [4 /*yield*/, db_1.prisma.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        var createdMatch;
                        var _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, tx.match.create({
                                        data: {
                                            status: "IN_CONVERSATION",
                                            counselorId: (_b = (_a = requester.counselor) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null,
                                        },
                                    })];
                                case 1:
                                    createdMatch = _c.sent();
                                    return [4 /*yield*/, tx.matchParticipant.createMany({
                                            data: [
                                                { matchId: createdMatch.id, userId: maleUser.id },
                                                { matchId: createdMatch.id, userId: femaleUser.id },
                                            ],
                                        })];
                                case 2:
                                    _c.sent();
                                    return [2 /*return*/, createdMatch];
                            }
                        });
                    }); })];
            case 3:
                match = _d.sent();
                return [2 /*return*/, {
                        id: match.id,
                        status: match.status,
                        createdAt: match.createdAt,
                        participants: [
                            {
                                accountId: maleUser.account.id,
                                firstName: maleUser.account.firstName,
                                lastName: maleUser.account.lastName,
                                email: maleUser.account.email,
                            },
                            {
                                accountId: femaleUser.account.id,
                                firstName: femaleUser.account.firstName,
                                lastName: femaleUser.account.lastName,
                                email: femaleUser.account.email,
                            },
                        ],
                    }];
        }
    });
}); };
exports.createManualMatch = createManualMatch;
var getActiveMatchForUser = function (accountId) { return __awaiter(void 0, void 0, void 0, function () {
    var user, participant, otherParticipant;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getUserByAccountId(accountId)];
            case 1:
                user = _a.sent();
                return [4 /*yield*/, db_1.prisma.matchParticipant.findFirst({
                        where: {
                            userId: user.id,
                            match: {
                                status: { in: ACTIVE_MATCH_STATUSES },
                            },
                        },
                        orderBy: { match: { createdAt: "desc" } },
                        include: {
                            match: {
                                include: {
                                    participants: {
                                        include: {
                                            user: {
                                                include: {
                                                    account: {
                                                        select: {
                                                            id: true,
                                                            firstName: true,
                                                            lastName: true,
                                                            email: true,
                                                        },
                                                    },
                                                    socialMediaHandles: {
                                                        select: {
                                                            platform: true,
                                                            handleOrUrl: true,
                                                        },
                                                        orderBy: { createdAt: "desc" },
                                                    },
                                                    church: {
                                                        select: {
                                                            id: true,
                                                            officialName: true,
                                                            aka: true,
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    })];
            case 2:
                participant = _a.sent();
                if (!participant) {
                    return [2 /*return*/, null];
                }
                otherParticipant = participant.match.participants.find(function (p) { return p.userId !== user.id; });
                return [2 /*return*/, {
                        id: participant.match.id,
                        status: participant.match.status,
                        createdAt: participant.match.createdAt,
                        endedAt: participant.match.endedAt,
                        participant: otherParticipant
                            ? {
                                accountId: otherParticipant.user.account.id,
                                userId: otherParticipant.user.id,
                                firstName: otherParticipant.user.account.firstName,
                                lastName: otherParticipant.user.account.lastName,
                                email: otherParticipant.user.account.email,
                                age: (0, ageUtils_1.calculateAge)(otherParticipant.user.dateOfBirth),
                                gender: otherParticipant.user.gender,
                                profilePictureUrl: otherParticipant.user.profilePictureUrl,
                                videoIntroUrl: otherParticipant.user.videoIntroUrl,
                                occupation: otherParticipant.user.occupation,
                                interests: otherParticipant.user.interests,
                                matchPreference: otherParticipant.user.matchPreference,
                                origin: {
                                    country: otherParticipant.user.originCountry,
                                    state: otherParticipant.user.originState,
                                    lga: otherParticipant.user.originLga,
                                },
                                residence: {
                                    country: otherParticipant.user.residenceCountry,
                                    state: otherParticipant.user.residenceState,
                                    city: otherParticipant.user.residenceCity,
                                    address: otherParticipant.user.residenceAddress,
                                },
                                church: otherParticipant.user.church,
                                socialMedia: otherParticipant.user.socialMediaHandles,
                            }
                            : null,
                    }];
        }
    });
}); };
exports.getActiveMatchForUser = getActiveMatchForUser;
var getMatchHistoryForUser = function (accountId) { return __awaiter(void 0, void 0, void 0, function () {
    var user, rows;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getUserByAccountId(accountId)];
            case 1:
                user = _a.sent();
                return [4 /*yield*/, db_1.prisma.matchParticipant.findMany({
                        where: { userId: user.id },
                        orderBy: { match: { createdAt: "desc" } },
                        include: {
                            match: {
                                include: {
                                    participants: {
                                        include: {
                                            user: {
                                                include: {
                                                    account: {
                                                        select: {
                                                            id: true,
                                                            firstName: true,
                                                            lastName: true,
                                                            email: true,
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    })];
            case 2:
                rows = _a.sent();
                return [2 /*return*/, rows.map(function (row) {
                        var otherParticipant = row.match.participants.find(function (p) { return p.userId !== user.id; });
                        return {
                            id: row.match.id,
                            status: row.match.status,
                            createdAt: row.match.createdAt,
                            endedAt: row.match.endedAt,
                            participant: otherParticipant
                                ? {
                                    accountId: otherParticipant.user.account.id,
                                    firstName: otherParticipant.user.account.firstName,
                                    lastName: otherParticipant.user.account.lastName,
                                    email: otherParticipant.user.account.email,
                                }
                                : null,
                        };
                    })];
        }
    });
}); };
exports.getMatchHistoryForUser = getMatchHistoryForUser;
var getMatchById = function (requesterAccountId, requesterRole, matchId) { return __awaiter(void 0, void 0, void 0, function () {
    var match, isParticipant;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.match.findUnique({
                    where: { id: matchId },
                    include: {
                        counselor: {
                            select: {
                                id: true,
                                account: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                        participants: {
                            include: {
                                user: {
                                    include: {
                                        account: {
                                            select: {
                                                id: true,
                                                firstName: true,
                                                lastName: true,
                                                email: true,
                                            },
                                        },
                                        church: {
                                            select: {
                                                id: true,
                                                officialName: true,
                                                aka: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                })];
            case 1:
                match = _a.sent();
                if (!match) {
                    throw new Error("Match not found");
                }
                if (!isElevatedRole(requesterRole)) {
                    isParticipant = match.participants.some(function (p) { return p.user.account.id === requesterAccountId; });
                    if (!isParticipant) {
                        throw new Error("You are not allowed to view this match");
                    }
                }
                return [2 /*return*/, {
                        id: match.id,
                        status: match.status,
                        createdAt: match.createdAt,
                        endedAt: match.endedAt,
                        compatibilityScore: match.compatibilityScore,
                        counselor: match.counselor
                            ? {
                                id: match.counselor.id,
                                accountId: match.counselor.account.id,
                                firstName: match.counselor.account.firstName,
                                lastName: match.counselor.account.lastName,
                                email: match.counselor.account.email,
                            }
                            : null,
                        participants: match.participants.map(function (participant) { return ({
                            id: participant.id,
                            userId: participant.user.id,
                            accountId: participant.user.account.id,
                            firstName: participant.user.account.firstName,
                            lastName: participant.user.account.lastName,
                            email: participant.user.account.email,
                            age: (0, ageUtils_1.calculateAge)(participant.user.dateOfBirth),
                            gender: participant.user.gender,
                            profilePictureUrl: participant.user.profilePictureUrl,
                            feedback: participant.feedback,
                            notes: participant.notes,
                            church: participant.user.church,
                            residence: {
                                country: participant.user.residenceCountry,
                                state: participant.user.residenceState,
                                city: participant.user.residenceCity,
                            },
                            occupation: participant.user.occupation,
                            interests: participant.user.interests,
                        }); }),
                    }];
        }
    });
}); };
exports.getMatchById = getMatchById;
var getMatchPublicProfile = function (viewerAccountId, targetAccountId) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, viewer, target, matchExists;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, Promise.all([
                    getUserByAccountId(viewerAccountId),
                    getUserByAccountId(targetAccountId),
                ])];
            case 1:
                _a = _b.sent(), viewer = _a[0], target = _a[1];
                return [4 /*yield*/, db_1.prisma.matchParticipant.findFirst({
                        where: {
                            userId: viewer.id,
                            match: {
                                participants: {
                                    some: {
                                        userId: target.id,
                                    },
                                },
                            },
                        },
                        select: { id: true },
                    })];
            case 2:
                matchExists = _b.sent();
                if (!matchExists) {
                    throw new Error("You can only view public profile for matched users");
                }
                return [2 /*return*/, {
                        accountId: target.account.id,
                        firstName: target.account.firstName,
                        lastName: target.account.lastName,
                        age: (0, ageUtils_1.calculateAge)(target.dateOfBirth),
                        gender: target.gender,
                        occupation: target.occupation || null,
                        interests: target.interests || null,
                        matchPreference: target.matchPreference,
                        origin: {
                            country: target.originCountry,
                            state: target.originState,
                            lga: target.originLga,
                        },
                        residence: {
                            country: target.residenceCountry,
                            state: target.residenceState,
                            city: target.residenceCity,
                            address: target.residenceAddress,
                        },
                        profilePictureUrl: target.profilePictureUrl,
                        videoIntroUrl: target.videoIntroUrl,
                        church: target.church
                            ? {
                                id: target.church.id,
                                officialName: target.church.officialName,
                                aka: target.church.aka,
                            }
                            : null,
                        socialMedia: target.socialMediaHandles.map(function (s) { return ({
                            platform: s.platform,
                            handleOrUrl: s.handleOrUrl,
                        }); }),
                    }];
        }
    });
}); };
exports.getMatchPublicProfile = getMatchPublicProfile;
var getMatchPublicProfileForMatch = function (viewerAccountId, viewerRole, matchId, targetAccountId) { return __awaiter(void 0, void 0, void 0, function () {
    var match, participantAccountIds, isParticipant, targetParticipant, target;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.match.findUnique({
                    where: { id: matchId },
                    include: {
                        participants: {
                            include: {
                                user: {
                                    include: {
                                        account: {
                                            select: {
                                                id: true,
                                                firstName: true,
                                                lastName: true,
                                            },
                                        },
                                        socialMediaHandles: {
                                            select: {
                                                platform: true,
                                                handleOrUrl: true,
                                            },
                                            orderBy: { createdAt: "desc" },
                                        },
                                        church: {
                                            select: {
                                                id: true,
                                                officialName: true,
                                                aka: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                })];
            case 1:
                match = _a.sent();
                if (!match) {
                    throw new Error("Match not found");
                }
                participantAccountIds = match.participants.map(function (p) { return p.user.account.id; });
                isParticipant = participantAccountIds.includes(viewerAccountId);
                if (!isElevatedRole(viewerRole) && !isParticipant) {
                    throw new Error("You can only view public profile for matched users");
                }
                targetParticipant = match.participants.find(function (p) { return p.user.account.id === targetAccountId; });
                if (!targetParticipant) {
                    throw new Error("Target user is not a participant in this match");
                }
                target = targetParticipant.user;
                return [2 /*return*/, {
                        accountId: target.account.id,
                        firstName: target.account.firstName,
                        lastName: target.account.lastName,
                        age: (0, ageUtils_1.calculateAge)(target.dateOfBirth),
                        gender: target.gender,
                        occupation: target.occupation || null,
                        interests: target.interests || null,
                        matchPreference: target.matchPreference,
                        origin: {
                            country: target.originCountry,
                            state: target.originState,
                            lga: target.originLga,
                        },
                        residence: {
                            country: target.residenceCountry,
                            state: target.residenceState,
                            city: target.residenceCity,
                            address: target.residenceAddress,
                        },
                        profilePictureUrl: target.profilePictureUrl,
                        videoIntroUrl: target.videoIntroUrl,
                        church: target.church,
                        socialMedia: target.socialMediaHandles.map(function (s) { return ({
                            platform: s.platform,
                            handleOrUrl: s.handleOrUrl,
                        }); }),
                    }];
        }
    });
}); };
exports.getMatchPublicProfileForMatch = getMatchPublicProfileForMatch;
var listMatches = function (filters) { return __awaiter(void 0, void 0, void 0, function () {
    var page, limit, skip, resolvedCounselorId, counselor, where, _a, rows, total;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                page = (filters === null || filters === void 0 ? void 0 : filters.page) || 1;
                limit = (filters === null || filters === void 0 ? void 0 : filters.limit) || 20;
                skip = (page - 1) * limit;
                resolvedCounselorId = filters === null || filters === void 0 ? void 0 : filters.counselorId;
                if (!(!resolvedCounselorId && (filters === null || filters === void 0 ? void 0 : filters.createdBy))) return [3 /*break*/, 2];
                return [4 /*yield*/, db_1.prisma.counselor.findUnique({
                        where: { accountId: filters.createdBy },
                        select: { id: true },
                    })];
            case 1:
                counselor = _b.sent();
                resolvedCounselorId = (counselor === null || counselor === void 0 ? void 0 : counselor.id) || filters.createdBy;
                _b.label = 2;
            case 2:
                where = {};
                if (filters === null || filters === void 0 ? void 0 : filters.status) {
                    where.status = filters.status;
                }
                if (resolvedCounselorId) {
                    where.counselorId = resolvedCounselorId;
                }
                if ((filters === null || filters === void 0 ? void 0 : filters.dateFrom) || (filters === null || filters === void 0 ? void 0 : filters.dateTo)) {
                    where.createdAt = __assign(__assign({}, (filters.dateFrom ? { gte: filters.dateFrom } : {})), (filters.dateTo ? { lte: filters.dateTo } : {}));
                }
                if (filters === null || filters === void 0 ? void 0 : filters.churchId) {
                    where.participants = {
                        some: {
                            user: {
                                churchId: filters.churchId,
                            },
                        },
                    };
                }
                return [4 /*yield*/, Promise.all([
                        db_1.prisma.match.findMany({
                            where: where,
                            skip: skip,
                            take: limit,
                            orderBy: { createdAt: "desc" },
                            include: {
                                participants: {
                                    include: {
                                        user: {
                                            select: {
                                                gender: true,
                                                dateOfBirth: true,
                                                profilePictureUrl: true,
                                                account: {
                                                    select: {
                                                        id: true,
                                                        firstName: true,
                                                        lastName: true,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        }),
                        db_1.prisma.match.count({ where: where }),
                    ])];
            case 3:
                _a = _b.sent(), rows = _a[0], total = _a[1];
                return [2 /*return*/, {
                        matches: rows.map(function (match) { return ({
                            id: match.id,
                            status: match.status,
                            createdAt: match.createdAt,
                            endedAt: match.endedAt,
                            compatibilityScore: match.compatibilityScore,
                            counselorId: match.counselorId,
                            participants: match.participants.map(function (participant) { return ({
                                accountId: participant.user.account.id,
                                firstName: participant.user.account.firstName,
                                lastName: participant.user.account.lastName,
                                gender: participant.user.gender,
                                age: (0, ageUtils_1.calculateAge)(participant.user.dateOfBirth),
                                profilePictureUrl: participant.user.profilePictureUrl,
                            }); }),
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
exports.listMatches = listMatches;
var findRandomCounselorId = function (churchId) { return __awaiter(void 0, void 0, void 0, function () {
    var counselors, index;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.prisma.counselor.findMany({
                    where: churchId ? { churchId: churchId } : undefined,
                    select: { id: true },
                })];
            case 1:
                counselors = _a.sent();
                if (!counselors.length) {
                    return [2 /*return*/, null];
                }
                index = Math.floor(Math.random() * counselors.length);
                return [2 /*return*/, counselors[index].id];
        }
    });
}); };
exports.findRandomCounselorId = findRandomCounselorId;
