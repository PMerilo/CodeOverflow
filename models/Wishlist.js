const sequelize = require('sequelize'); 
const db = require('../config/DBConfig');

class Wishlist extends sequelize.Model{

}

Wishlist.init({
},
{
    freezeTableName: true,
    timestamps: true,
    sequelize: db,
    modelName: "wishlist",
}
)  

module.exports = Wishlist