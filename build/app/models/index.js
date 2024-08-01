"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate = void 0;
// sequelize
const sequelize_1 = require("sequelize");
// config
const db_1 = require("../../config/db");
// models
const user_1 = __importDefault(require("./user"));
const message_1 = __importDefault(require("./message"));
const migrate = () => __awaiter(void 0, void 0, void 0, function* () {
    const sequelize = new sequelize_1.Sequelize(db_1.dbConfig.db, db_1.dbConfig.user, db_1.dbConfig.password, {
        host: "localhost",
        dialect: "postgres",
        logging: console.log
    });
    try {
        yield sequelize.authenticate();
        console.log("Connection has been established successfully.");
    }
    catch (error) {
        console.error("Unable to connect to the database", error);
    }
    (0, user_1.default)(sequelize);
    (0, message_1.default)(sequelize);
    sequelize.sync({ alter: true });
    return sequelize;
});
exports.migrate = migrate;
