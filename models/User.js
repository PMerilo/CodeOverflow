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
            unique: 'name',

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
            set(value) {
                if (value) {
                    const hash = bcrypt.hashSync(value, 10) + "";
                    this.setDataValue("password", hash);
                }
            },
        },
        banned: {
            type: sequelize.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        }
    },
    {
        freezeTableName: true,
        timestamps: true,
        sequelize: db,
        modelName: "user",
    }
);

module.exports = User;