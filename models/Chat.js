const sequelize = require('sequelize');
const db = require('../config/DBConfig');

class Chat extends sequelize.Model {

}
Chat.init({
    open: { type: sequelize.BOOLEAN, allowNull: false, defaultValue: true },
    status: { type: sequelize.ENUM('Waiting for offer', 'Offered', 'Refused Offer', 'Counter Offered', 'Accepted Offer','Payment Made'), allowNull: false, defaultValue: 'Waiting for offer' },
    offer: { type: sequelize.DECIMAL(10,2) },
},
    {
        timestamps: true,
        sequelize: db,
        modelName: "chat",
    }
)


module.exports = Chat;