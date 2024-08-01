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
exports.initWsServer = void 0;
const sequelize_1 = require("sequelize");
const socket_io_1 = __importDefault(require("socket.io"));
const socketio_jwt_1 = __importDefault(require("socketio-jwt"));
const jwt_1 = require("../config/jwt");
const sockets = [];
const initWsServer = (listener, sequelize) => {
    const io = new socket_io_1.default.Server(listener, {
        transports: ["polling", "websocket"],
        cors: {
            origin: "http://localhost:3000"
        }
    });
    io.use(socketio_jwt_1.default.authorize({
        secret: jwt_1.jwtAccessSecret,
        handshake: true
    }));
    io.use((socket, next) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield sequelize.models.user.findOne({
            where: { account: { [sequelize_1.Op.eq]: socket.decoded_token.account } }
        });
        if (!user) {
            yield sequelize.models.user.create({
                account: socket.decoded_token.account
            });
        }
        socket.account = socket.decoded_token.account;
        next();
    }));
    io.on("connection", (socket) => {
        console.log(socket.account);
        // socket.join(socket.account);
        const found = sockets.find((value) => value.account === socket.account);
        found !== undefined
            ? (found.id = socket.id)
            : sockets.push({ id: socket.id, account: socket.account });
        socket.on("connections", () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const res = yield sequelize.query(`SELECT account FROM (SELECT concat_ws("from", "to") as account FROM messages WHERE "from"='${socket.account}' OR "to"='${socket.account}' GROUP BY "from", "to") WHERE account!='${socket.account}'`, { type: sequelize_1.QueryTypes.SELECT });
            const connections = [];
            if (res && res.length) {
                // eslint-disable-next-line @hapi/for-loop
                for (let i = 0; i < res.length; i++) {
                    let user = yield sequelize.models.user.findOne({
                        where: { account: res[i].account }
                    });
                    if (!user) {
                        user = yield sequelize.models.user.create({
                            account: res[i].account
                        });
                    }
                    connections.push({
                        avatar: user.dataValues.avatar,
                        account: user.dataValues.account,
                        fullName: user.dataValues.fullName,
                        recent: (_a = (yield sequelize.models.message.findOne({
                            where: {
                                [sequelize_1.Op.or]: [
                                    { from: socket.account, to: res[i].account },
                                    { from: res[i].account, to: socket.account }
                                ]
                            }
                        }))) === null || _a === void 0 ? void 0 : _a.dataValues
                    });
                    console.log(connections);
                }
            }
            io.to(socket.id).emit("connections", connections);
        }));
        socket.on("messages", ({ partner, timestamp }) => __awaiter(void 0, void 0, void 0, function* () {
            const messages = yield sequelize.models.message.findAll({
                where: {
                    [sequelize_1.Op.or]: [
                        { from: socket.account, to: partner },
                        { from: partner, to: socket.account }
                    ],
                    timestamp: { [sequelize_1.Op.gt]: timestamp }
                },
                limit: 20
            });
            io.to(socket.id).emit("messages", messages);
        }));
        socket.on("send", ({ to, message }) => __awaiter(void 0, void 0, void 0, function* () {
            const msgData = {
                from: socket.account,
                to,
                message,
                timestamp: Date.now()
            };
            const messageInstance = yield sequelize.models.message.create(msgData);
            io.to(socket.id).emit("receive", Object.assign({ id: messageInstance.dataValues.id }, msgData));
            const _found = sockets.find((value) => value.account === to);
            if (_found !== undefined) {
                io.to(_found.id).emit("receive", Object.assign({ id: messageInstance.dataValues.id }, msgData));
            }
        }));
        socket.on("message_checked", ({ id }) => __awaiter(void 0, void 0, void 0, function* () {
            const message = yield sequelize.models.message.findOne({
                where: { to: socket.account, id }
            });
            if (message) {
                message.update({ checked: true });
                message.save();
                io.to(message.dataValues.to).emit("message_checked", {
                    id: message.dataValues.id
                });
            }
        }));
    });
    return io;
};
exports.initWsServer = initWsServer;
