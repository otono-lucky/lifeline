"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAge = void 0;
var calculateAge = function (dateOfBirth) {
    if (!dateOfBirth)
        return null;
    var now = new Date();
    var age = now.getFullYear() - dateOfBirth.getFullYear();
    var monthDiff = now.getMonth() - dateOfBirth.getMonth();
    var dayDiff = now.getDate() - dateOfBirth.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age -= 1;
    }
    return age;
};
exports.calculateAge = calculateAge;
