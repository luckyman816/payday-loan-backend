// sequelize
import { DataTypes } from "sequelize";
import type { Sequelize } from "sequelize";

const Message = (sequelize: Sequelize) => {
  return sequelize.define("message", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    from: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        is: /^0x[0-9a-zA-Z]{40}$/
      }
    },
    to: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        is: /^0x[0-9a-zA-Z]{40}$/
      }
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    timestamp: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: Date.now(),
      validate: {
        notEmpty: true
      }
    },
    checked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  });
};

export default Message;
