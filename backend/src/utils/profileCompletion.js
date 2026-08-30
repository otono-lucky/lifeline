"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateProfileCompletion = void 0;
var constants_1 = require("../constants");
var isNonEmptyString = function (val) {
    return typeof val === "string" && val.trim().length > 0;
};
var calculateProfileCompletion = function (user) {
    var missingFields = [];
    // Criteria breakdown & weights
    var checks = [
        {
            name: "Gender",
            passed: Boolean(user.gender),
            weight: 5,
        },
        {
            name: "Date of Birth",
            passed: Boolean(user.dateOfBirth),
            weight: 5,
        },
        {
            name: "Origin Location (Country, State, LGA)",
            passed: isNonEmptyString(user.originCountry) &&
                isNonEmptyString(user.originState) &&
                isNonEmptyString(user.originLga),
            weight: 10,
        },
        {
            name: "Residence Location & Map Geocoding",
            passed: isNonEmptyString(user.residenceCountry) &&
                isNonEmptyString(user.residenceState) &&
                isNonEmptyString(user.residenceCity) &&
                isNonEmptyString(user.residenceAddress),
            weight: 10,
        },
        {
            name: "Church Selection",
            passed: isNonEmptyString(user.churchId),
            weight: 10,
        },
        {
            name: "Occupation",
            passed: isNonEmptyString(user.occupation),
            weight: 5,
        },
        {
            name: "Standardized Salary Range",
            passed: Boolean(user.salaryRange),
            weight: 10,
        },
        {
            name: "Interests (at least 3)",
            passed: Array.isArray(user.interests) && user.interests.length >= 3,
            weight: 10,
        },
        {
            name: "Match Preference",
            passed: Boolean(user.matchPreference),
            weight: 5,
        },
        {
            name: "WhatsApp Number",
            passed: isNonEmptyString(user.whatsappNumber),
            weight: 5,
        },
        {
            name: "Exactly ".concat(constants_1.REQUIRED_PHOTOS_COUNT, " Profile Photos"),
            passed: Array.isArray(user.photos) && user.photos.length === constants_1.REQUIRED_PHOTOS_COUNT,
            weight: 15,
        },
        {
            name: "Introductory Video (< 1 minute)",
            // If videoDurationSeconds is stored, enforce the <=60s rule.
            // Fall back to URL presence only for legacy records without a stored duration.
            passed: isNonEmptyString(user.videoIntroUrl)
                ? user.videoDurationSeconds != null
                    ? user.videoDurationSeconds <= 60
                    : true
                : false,
            weight: 10,
        },
        {
            name: "2-of-3 Social Handles (".concat(constants_1.SOCIAL_PLATFORM_OPTIONS.join(", "), ")"),
            passed: (function () {
                if (!Array.isArray(user.socialMediaHandles))
                    return false;
                var validPlatforms = user.socialMediaHandles.filter(function (s) {
                    return constants_1.SOCIAL_PLATFORM_OPTIONS.includes(s.platform) &&
                        isNonEmptyString(s.handleOrUrl);
                });
                var uniquePlatforms = new Set(validPlatforms.map(function (s) { return s.platform; }));
                return uniquePlatforms.size >= constants_1.MIN_SOCIAL_HANDLES_REQUIRED;
            })(),
            weight: 10,
        },
    ];
    var percentage = 0;
    for (var _i = 0, checks_1 = checks; _i < checks_1.length; _i++) {
        var check = checks_1[_i];
        if (check.passed) {
            percentage += check.weight;
        }
        else {
            missingFields.push(check.name);
        }
    }
    // Cap percentage between 0 and 100
    percentage = Math.min(100, Math.max(0, percentage));
    var isComplete = percentage === 100;
    return {
        percentage: percentage,
        isComplete: isComplete,
        missingFields: missingFields,
    };
};
exports.calculateProfileCompletion = calculateProfileCompletion;
