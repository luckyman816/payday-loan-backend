"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtAccessSecret = void 0;
exports.jwtAccessSecret = process.env.JWT_ACCESS_SECRET || "json-web-token-access-secret";
