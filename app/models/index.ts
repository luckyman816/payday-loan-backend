// sequelize
import { Sequelize } from "sequelize";

// config
import { dbConfig } from "../../config/db";

// models
import User from "./user";
import Message from "./message";

export const migrate = async () => {
  const sequelize = new Sequelize(
    dbConfig.db,
    dbConfig.user,
    dbConfig.password,
    {
      host: "localhost",
      dialect: "postgres",
      logging: console.log
    }
  );

  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database", error);
  }

  User(sequelize);
  Message(sequelize);

  sequelize.sync({ alter: true });

  return sequelize;
};
