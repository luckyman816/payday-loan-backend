// hapi
import Hapi from "@hapi/hapi";

// third-party
import Joi, { symbol } from "joi";
import * as utils from "ethereumjs-util";

// project import
import { initWsServer } from "./app/websocket";
import { migrate } from "./app/models";
import { createAccessToken } from "./app/helpers/jwt";
import axios from "axios";

export type Top100CoinType = {
  id: string;
  name: string;
  symbol: string;
  address?: string;
  icon?: string;
};

export type TokenOfCoingeckoType = {
  id: string;
  symbol: string;
  name: string;
  platforms: {
    ethereum?: string;
    "binance-smart-chain"?: string;
  };
};

const validateOptions = { abortEarly: false, stripUnknown: true };

let top100EthereumCoins: Top100CoinType[];
let top100BSCCoins: Top100CoinType[];
let tokenListOfEthereum: TokenOfCoingeckoType[];
let tokenListOfBSC: TokenOfCoingeckoType[];

const getTokenListFromCoingecko = async () => {
  await axios
    .get("https://api.coingecko.com/api/v3/coins/list?include_platform=true")
    .then((res) => {
      const tokenListOfCoingecko = res.data;
      const _tokenListOfEthereum = tokenListOfCoingecko?.filter(
        (token: TokenOfCoingeckoType) => token.platforms.ethereum !== undefined
      );
      const _tokenListOfBSC = tokenListOfCoingecko?.filter(
        (token: TokenOfCoingeckoType) =>
          token.platforms["binance-smart-chain"] !== undefined
      );
      tokenListOfEthereum = _tokenListOfEthereum;
      tokenListOfBSC = _tokenListOfBSC;
      console.log("SUCCESS getTokenListOfEthereumFromCoingecko");
    })
    .catch(() => {
      console.log("ERROR getTokenListOfEthereumFromCoingecko");
    });
};

const getTop100EthereumTokenListByMarketCapFromCoingecko = async () => {
  await axios
    .get(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1"
    )
    .then((res) => {
      const temp = res.data;

      let result: Top100CoinType[] = [
        {
          id: "ethereum",
          symbol: "eth",
          name: "Ethereum",
          icon: "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
          address: "0x0000000000000000000000000000000000000000"
        }
      ];

      for (let i = 0; i < temp?.length; i++) {
        if (
          tokenListOfEthereum?.some(
            (tokenOfEthereum) => tokenOfEthereum.id === temp[i].id
          )
        ) {
          result.push({
            id: temp[i].id,
            name: temp[i].name,
            symbol: temp[i].symbol,
            address: tokenListOfEthereum?.find(
              (tokenOfEthereum) => tokenOfEthereum.id === temp[i].id
            )?.platforms.ethereum,
            icon: temp[i].image
          });
        }
      }

      top100EthereumCoins = result;
      console.log("SUCCESS getTop100EthereumTokenListByMarketCapFromCoingecko");
    })
    .catch((error) => {
      console.log(
        "ERROR getTop100EthereumTokenListByMarketCapFromCoingecko",
        error
      );
    });
};

const getTop100BSCTokenListByMarketCapFromCoingecko = async () => {
  await axios
    .get(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1"
    )
    .then((res) => {
      const temp = res.data;

      let result: Top100CoinType[] = [
        {
          id: "binancecoin",
          symbol: "bnb",
          name: "BNB",
          icon: "https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png",
          address: "0x0000000000000000000000000000000000000000"
        }
      ];

      for (let i = 0; i < temp?.length; i++) {
        if (
          tokenListOfBSC?.some((tokenOfBSC) => tokenOfBSC.id === temp[i].id)
        ) {
          result.push({
            id: temp[i].id,
            name: temp[i].name,
            symbol: temp[i].symbol,
            address: tokenListOfBSC?.find(
              (tokenOfBSC) => tokenOfBSC.id === temp[i].id
            )?.platforms["binance-smart-chain"],
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
};

const refreshTokenList = async () => {
  await getTokenListFromCoingecko();
  await getTop100EthereumTokenListByMarketCapFromCoingecko();
  await getTop100BSCTokenListByMarketCapFromCoingecko();
};

const init = async () => {
  const sequelize = await migrate();

  // https server
  const httpServer = new Hapi.Server({
    port: process.env.PORT,
    routes: {
      cors: true
    }
  });

  refreshTokenList();
  setInterval(refreshTokenList, 1000 * 60 * 30);

  // websocket server
  const wsServer = new Hapi.Server({ port: process.env.WSS_PORT });
  initWsServer(wsServer.listener, sequelize);

  httpServer.route([
    {
      method: "POST",
      path: "/current",
      options: {
        auth: false,
        validate: {
          payload: Joi.object({
            signature: Joi.string()
              .length(132)
              .regex(/^0x[0-9a-fA-F]+$/)
              .required(),
            account: Joi.string()
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
            const { signature, account } = req.payload as {
              signature: string;
              account: string;
            };
            const r = utils.toBuffer(signature.slice(0, 66));
            const s = utils.toBuffer("0x" + signature.slice(66, 130));
            const v = utils.toBuffer("0x" + signature.slice(130, 132));
            // const m = utils.toBuffer(
            //   JSON.stringify({ version: "1.0.0", project: "Solidx" })
            // );
            // const pub = utils.ecrecover(m, v, r, s);
            // const recoveredAccount =
            //   "0x" + utils.pubToAddress(pub).toString("hex");
            const msg =
              "\x19Ethereum Signed Message:\n" +
              JSON.stringify({ version: "1.0.0", project: "Solidx" }).length +
              JSON.stringify({ version: "1.0.0", project: "Solidx" });
            const m = utils.keccak(Buffer.from(msg));
            const pubKey = utils.ecrecover(m, v, r, s);
            const addrBuf = utils.pubToAddress(pubKey);
            const recoveredAccount = utils.bufferToHex(addrBuf);

            if (
              utils.toChecksumAddress(account) !==
              utils.toChecksumAddress(recoveredAccount)
            ) {
              return h.response({ message: "Invalid Signature" }).code(400);
            }

            return h
              .response({ accessToken: createAccessToken(account) })
              .code(200);
          } catch (error) {
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
            const { chainId } = req.payload as {
              chainId: number;
            };
            console.log("POST /top100Coins ------------------------>");
            if (chainId === 1)
              return h.response({ coins: top100EthereumCoins }).code(200);
            else if (chainId === 56)
              return h.response({ coins: top100BSCCoins }).code(200);
          } catch (error) {
            console.log(error);
            return h.response({ message: "Something wrong" }).code(400);
          }
        }
      }
    }
  ]);

  await httpServer
    .start()
    .then(() => console.log(`HTTP Server running on Port ${process.env.PORT}`));
  await wsServer
    .start()
    .then(() =>
      console.log(`WS Server running on Port ${process.env.WSS_PORT}`)
    );
};

init();
