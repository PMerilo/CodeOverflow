const sequelize = require('sequelize');
const db = require('../config/DBConfig.js');
const bcrypt = require("bcrypt");

class User extends sequelize.Model {
    compareHash(val) {
        return bcrypt.compareSync(val, this.getDataValue("password"));
    }
}

User.init(
    {
        profilepic: {
            type: sequelize.DataTypes.STRING,
            allowNull: true,
        },
        name: {
            type: sequelize.DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: sequelize.DataTypes.STRING,
            allowNull: false,
            unique: 'email',
        },
        gender: {
            type: sequelize.DataTypes.STRING,
            allowNull: true
        },
        phoneNumber: {
            type: sequelize.DataTypes.STRING(8),
            allowNull: true,
        },
        password: {
            type: sequelize.DataTypes.STRING,
        },
        banned: {
            type: sequelize.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        about: {
            type: sequelize.DataTypes.TEXT('long'),
        },
        cf: {
            type: sequelize.DataTypes.FLOAT,
            defaultValue: 0,
        },
        total_balance: {
            type: sequelize.DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
        },
        withdrawn_amount: {
            type: sequelize.DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
        },
        bankAccount: {
            type: sequelize.DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
        sequelize: db,
        modelName: "user",
    }
);

module.exports = User;