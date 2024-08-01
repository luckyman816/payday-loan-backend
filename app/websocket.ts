import { Op, QueryTypes, Sequelize } from "sequelize";
import SocketIO from "socket.io";
import socketioJwt from "socketio-jwt";

import { jwtAccessSecret } from "../config/jwt";

const sockets: {
  account: string;
  id: string;
}[] = [];

export const initWsServer = (listener: any, sequelize: Sequelize) => {
  const io = new SocketIO.Server(listener, {
    transports: ["polling", "websocket"],
    cors: {
      origin: "*"
    }
  });
  io.use(
    socketioJwt.authorize({
      secret: jwtAccessSecret,
      handshake: true
    })
  );

  io.use(async (socket: any, next) => {
    const user = await sequelize.models.user.findOne({
      where: { account: { [Op.eq]: socket.decoded_token.account } }
    });

    if (!user) {
      await sequelize.models.user.create({
        account: socket.decoded_token.account
      });
    }

    socket.account = socket.decoded_token.account;

    next();
  });

  io.on("connection", (socket: any) => {
    console.log(socket.account);

    // socket.join(socket.account);
    const found = sockets.find((value) => value.account === socket.account);
    found !== undefined
      ? (found.id = socket.id)
      : sockets.push({ id: socket.id, account: socket.account });

    socket.on("connections", async () => {
      const res: any[] = await sequelize.query(
        `SELECT account FROM (SELECT concat_ws("from", "to") as account FROM messages WHERE "from"='${socket.account}' OR "to"='${socket.account}' GROUP BY "from", "to") WHERE account!='${socket.account}'`,
        { type: QueryTypes.SELECT }
      );
      const connections: {
        avatar: string;
        account: string;
        fullName: string;
        recent: any;
      }[] = [];
      if (res && res.length) {
        // eslint-disable-next-line @hapi/for-loop
        for (let i = 0; i < res.length; i++) {
          let user = await sequelize.models.user.findOne({
            where: { account: res[i].account }
          });
          if (!user) {
            user = await sequelize.models.user.create({
              account: res[i].account
            });
          }

          connections.push({
            avatar: user.dataValues.avatar,
            account: user.dataValues.account,
            fullName: user.dataValues.fullName,
            recent: (
              await sequelize.models.message.findOne({
                where: {
                  [Op.or]: [
                    { from: socket.account, to: res[i].account },
                    { from: res[i].account, to: socket.account }
                  ]
                }
              })
            )?.dataValues
          });

          console.log(connections);
        }
      }

      io.to(socket.id).emit("connections", connections);
    });

    socket.on(
      "messages",
      async ({
        partner,
        timestamp
      }: {
        partner: string;
        timestamp: number;
      }) => {
        const messages = await sequelize.models.message.findAll({
          where: {
            [Op.or]: [
              { from: socket.account, to: partner },
              { from: partner, to: socket.account }
            ],
            timestamp: { [Op.gt]: timestamp }
          },
          limit: 20
        });
        io.to(socket.id).emit("messages", messages);
      }
    );

    socket.on(
      "send",
      async ({ to, message }: { to: string; message: string }) => {
        const msgData = {
          from: socket.account,
          to,
          message,
          timestamp: Date.now()
        };
        const messageInstance = await sequelize.models.message.create(msgData);
        io.to(socket.id).emit("receive", {
          id: messageInstance.dataValues.id,
          ...msgData
        });
        const _found = sockets.find((value) => value.account === to);
        if (_found !== undefined) {
          io.to(_found.id).emit("receive", {
            id: messageInstance.dataValues.id,
            ...msgData
          });
        }
      }
    );

    socket.on("message_checked", async ({ id }: { id: string }) => {
      const message = await sequelize.models.message.findOne({
        where: { to: socket.account, id }
      });
      if (message) {
        message.update({ checked: true });
        message.save();
        io.to(message.dataValues.to).emit("message_checked", {
          id: message.dataValues.id
        });
      }
    });
  });

  return io;
};
