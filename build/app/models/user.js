"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// sequelize
const sequelize_1 = require("sequelize");
const User = (sequelize) => {
    return sequelize.define("user", {
        id: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4
        },
        avatar: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            validate: {
                notEmpty: true
            }
        },
        fullName: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            validate: {
                notEmpty: true
            }
        },
        account: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true,
                is: /^0x[0-9a-zA-Z]{40}$/
            }
        }
    });
};
exports.default = User;
