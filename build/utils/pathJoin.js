"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathJoin = void 0;
const path_1 = __importDefault(require("path"));
const pathJoin = (path1, path2) => {
    return path_1.default.join(path1, path2).replace(/\\/g, "/");
};
exports.pathJoin = pathJoin;
