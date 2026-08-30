"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MIN_SOCIAL_HANDLES_REQUIRED = exports.MAX_VIDEO_DURATION_SECONDS = exports.REQUIRED_PHOTOS_COUNT = exports.MAX_ACTIVE_REQUEST_SLOTS = exports.MATCH_PREFERENCE_OPTIONS = exports.SOCIAL_PLATFORM_OPTIONS = exports.SALARY_RANGES = exports.STATUS_TYPES = void 0;
exports.STATUS_TYPES = ["pending", "active", "suspended", "deleted"];
exports.SALARY_RANGES = [
    "RANGE_0_100K",
    "RANGE_100K_500K",
    "RANGE_500K_1M",
    "RANGE_1M_PLUS",
];
exports.SOCIAL_PLATFORM_OPTIONS = [
    "LinkedIn",
    "Instagram",
    "Facebook",
];
exports.MATCH_PREFERENCE_OPTIONS = [
    "my_church",
    "my_church_plus",
    "other_churches",
];
exports.MAX_ACTIVE_REQUEST_SLOTS = 3;
exports.REQUIRED_PHOTOS_COUNT = 3;
exports.MAX_VIDEO_DURATION_SECONDS = 60;
exports.MIN_SOCIAL_HANDLES_REQUIRED = 2; // "2-of-3" rule
