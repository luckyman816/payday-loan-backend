"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// sequelize
const sequelize_1 = require("sequelize");
const Message = (sequelize) => {
    return sequelize.define("message", {
        id: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4
        },
        from: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                is: /^0x[0-9a-zA-Z]{40}$/
            }
        },
        to: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                is: /^0x[0-9a-zA-Z]{40}$/
            }
        },
        message: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        timestamp: {
            type: sequelize_1.DataTypes.BIGINT,
            allowNull: false,
            defaultValue: Date.now(),
            validate: {
                notEmpty: true
            }
        },
        checked: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });
};
exports.default = Message;
