"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConfig = void 0;
exports.dbConfig = {
    db: "solidx",
    user: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres"
};
