"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_1 = require("../../config/jwt");
const createAccessToken = (account) => {
    return jsonwebtoken_1.default.sign({ account }, jwt_1.jwtAccessSecret, {
        algorithm: "HS256",
        expiresIn: "1h"
    });
};
exports.createAccessToken = createAccessToken;
