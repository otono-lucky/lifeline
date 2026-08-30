"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
var env_1 = require("../config/env");
var generateToken = function (account) {
    return jsonwebtoken_1.default.sign({
        id: account.id,
        email: account.email,
        role: account.role,
        firstName: account.firstName || ""
    }, env_1.default.jwtSecret, {
        expiresIn: "30d",
    });
};
exports.generateToken = generateToken;
