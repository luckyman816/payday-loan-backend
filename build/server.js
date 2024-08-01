"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
// hapi
const hapi_1 = __importDefault(require("@hapi/hapi"));
// third-party
const joi_1 = __importDefault(require("joi"));
const utils = __importStar(require("ethereumjs-util"));
// project import
const websocket_1 = require("./app/websocket");
const models_1 = require("./app/models");
const jwt_1 = require("./app/helpers/jwt");
const axios_1 = __importDefault(require("axios"));
const validateOptions = { abortEarly: false, stripUnknown: true };
let top100EthereumCoins;
let top100BSCCoins;
let tokenListOfEthereum;
let tokenListOfBSC;
const getTokenListFromCoingecko = () => __awaiter(void 0, void 0, void 0, function* () {
    yield axios_1.default
        .get("https://api.coingecko.com/api/v3/coins/list?include_platform=true")
        .then((res) => {
        const tokenListOfCoingecko = res.data;
        const _tokenListOfEthereum = tokenListOfCoingecko === null || tokenListOfCoingecko === void 0 ? void 0 : tokenListOfCoingecko.filter((token) => token.platforms.ethereum !== undefined);
        const _tokenListOfBSC = tokenListOfCoingecko === null || tokenListOfCoingecko === void 0 ? void 0 : tokenListOfCoingecko.filter((token) => token.platforms["binance-smart-chain"] !== undefined);
        tokenListOfEthereum = _tokenListOfEthereum;
        tokenListOfBSC = _tokenListOfBSC;
        console.log("SUCCESS getTokenListOfEthereumFromCoingecko");
    })
        .catch(() => {
        console.log("ERROR getTokenListOfEthereumFromCoingecko");
    });
});
const getTop100EthereumTokenListByMarketCapFromCoingecko = () => __awaiter(void 0, void 0, void 0, function* () {
    yield axios_1.default
        .get("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1")
        .then((res) => {
        var _a;
        const temp = res.data;
        let result = [
            {
                id: "ethereum",
                symbol: "eth",
                name: "Ethereum",
                icon: "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
                address: "0x0000000000000000000000000000000000000000"
            }
        ];
        for (let i = 0; i < (temp === null || temp === void 0 ? void 0 : temp.length); i++) {
            if (tokenListOfEthereum === null || tokenListOfEthereum === void 0 ? void 0 : tokenListOfEthereum.some((tokenOfEthereum) => tokenOfEthereum.id === temp[i].id)) {
                result.push({
                    id: temp[i].id,
                    name: temp[i].name,
                    symbol: temp[i].symbol,
                    address: (_a = tokenListOfEthereum === null || tokenListOfEthereum === void 0 ? void 0 : tokenListOfEthereum.find((tokenOfEthereum) => tokenOfEthereum.id === temp[i].id)) === null || _a === void 0 ? void 0 : _a.platforms.ethereum,
                    icon: temp[i].image
                });
            }
        }
        top100EthereumCoins = result;
        console.log("SUCCESS getTop100EthereumTokenListByMarketCapFromCoingecko");
    })
        .catch((error) => {
        console.log("ERROR getTop100EthereumTokenListByMarketCapFromCoingecko", error);
    });
});
const getTop100BSCTokenListByMarketCapFromCoingecko = () => __awaiter(void 0, void 0, void 0, function* () {
    yield axios_1.default
        .get("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1")
        .then((res) => {
        var _a;
        const temp = res.data;
        let result = [
            {
                id: "binancecoin",
                symbol: "bnb",
                name: "BNB",
                icon: "https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png",
                address: "0x0000000000000000000000000000000000000000"
            }
        ];
        for (let i = 0; i < (temp === null || temp === void 0 ? void 0 : temp.length); i++) {
            if (tokenListOfBSC === null || tokenListOfBSC === void 0 ? void 0 : tokenListOfBSC.some((tokenOfBSC) => tokenOfBSC.id === temp[i].id)) {
                result.push({
                    id: temp[i].id,
                    name: temp[i].name,
                    symbol: temp[i].symbol,
                    address: (_a = tokenListOfBSC === null || tokenListOfBSC === void 0 ? void 0 : tokenListOfBSC.find((tokenOfBSC) => tokenOfBSC.id === temp[i].id)) === null || _a === void 0 ? void 0 : _a.platforms["binance-smart-chain"],
                    icon: temp[i].image
                });
            }
        }
        top100BSCCoins = result;
        console.log("SUCCESS getTop100BSCTokenListByMarketCapFromCoingecko");
    })
        .catch((error) => {
        console.log("ERROR getTop100BSCTokenListByMarketCapFromCoingecko", error);
    });
});
const refreshTokenList = () => __awaiter(void 0, void 0, void 0, function* () {
    yield getTokenListFromCoingecko();
    yield getTop100EthereumTokenListByMarketCapFromCoingecko();
    yield getTop100BSCTokenListByMarketCapFromCoingecko();
});
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    const sequelize = yield (0, models_1.migrate)();
    // https server
    const httpServer = new hapi_1.default.Server({
        port: process.env.PORT,
        routes: {
            cors: true
        }
    });
    refreshTokenList();
    setInterval(refreshTokenList, 1000 * 60 * 30);
    // websocket server
    const wsServer = new hapi_1.default.Server({ port: process.env.WSS_PORT });
    (0, websocket_1.initWsServer)(wsServer.listener, sequelize);
    httpServer.route([
        {
            method: "POST",
            path: "/current",
            options: {
                auth: false,
                validate: {
                    payload: joi_1.default.object({
                        signature: joi_1.default.string()
                            .length(132)
                            .regex(/^0x[0-9a-fA-F]+$/)
                            .required(),
                        account: joi_1.default.string()
                            .length(42)
                            .regex(/^0x[0-9a-fA-F]+$/)
                            .required()
                    }),
                    failAction: (_req, h, error) => {
                        console.log(error);
                        return h
                            .response({ message: "Invalid Signature or Account" })
                            .code(400)
                            .takeover();
                    },
                    options: validateOptions
                },
                handler: (req, h) => {
                    try {
                        const { signature, account } = req.payload;
                        const r = utils.toBuffer(signature.slice(0, 66));
                        const s = utils.toBuffer("0x" + signature.slice(66, 130));
                        const v = utils.toBuffer("0x" + signature.slice(130, 132));
                        // const m = utils.toBuffer(
                        //   JSON.stringify({ version: "1.0.0", project: "Solidx" })
                        // );
                        // const pub = utils.ecrecover(m, v, r, s);
                        // const recoveredAccount =
                        //   "0x" + utils.pubToAddress(pub).toString("hex");
                        const msg = "\x19Ethereum Signed Message:\n" +
                            JSON.stringify({ version: "1.0.0", project: "Solidx" }).length +
                            JSON.stringify({ version: "1.0.0", project: "Solidx" });
                        const m = utils.keccak(Buffer.from(msg));
                        const pubKey = utils.ecrecover(m, v, r, s);
                        const addrBuf = utils.pubToAddress(pubKey);
                        const recoveredAccount = utils.bufferToHex(addrBuf);
                        if (utils.toChecksumAddress(account) !==
                            utils.toChecksumAddress(recoveredAccount)) {
                            return h.response({ message: "Invalid Signature" }).code(400);
                        }
                        return h
                            .response({ accessToken: (0, jwt_1.createAccessToken)(account) })
                            .code(200);
                    }
                    catch (error) {
                        console.log(error);
                        return h
                            .response({ message: "Invalid Email or Password" })
                            .code(400);
                    }
                }
            }
        }
    ]);
    httpServer.route([
        {
            method: "POST",
            path: "/top100Coins",
            options: {
                auth: false,
                handler: (req, h) => {
                    try {
                        const { chainId } = req.payload;
                        console.log("POST /top100Coins ------------------------>");
                        if (chainId === 1)
                            return h.response({ coins: top100EthereumCoins }).code(200);
                        else if (chainId === 56)
                            return h.response({ coins: top100BSCCoins }).code(200);
                    }
                    catch (error) {
                        console.log(error);
                        return h.response({ message: "Something wrong" }).code(400);
                    }
                }
            }
        }
    ]);
    yield httpServer
        .start()
        .then(() => console.log(`HTTP Server running on Port ${process.env.PORT}`));
    yield wsServer
        .start()
        .then(() => console.log(`WS Server running on Port ${process.env.WSS_PORT}`));
});
init();
