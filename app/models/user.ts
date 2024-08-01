// sequelize
import { DataTypes } from "sequelize";
import type { Sequelize } from "sequelize";

const User = (sequelize: Sequelize) => {
  return sequelize.define("user", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        notEmpty: true
      }
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        notEmpty: true
      }
    },
    account: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        is: /^0x[0-9a-zA-Z]{40}$/
      }
    }
  });
};

export default User;
