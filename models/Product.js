const sequelize = require('sequelize'); 
const db = require('../config/DBConfig');

// Create Product table in MySQL Database

class Product extends sequelize.Model{

}
Product.init({
        sku:{type: sequelize.INTEGER, autoIncrement: true, primaryKey: true},
        name: { type: sequelize.STRING }, 
        description: { type: sequelize.STRING(2000) }, 
        price: { type: sequelize.FLOAT }, 
        quantity: {type: sequelize.INTEGER},
        category:{type:sequelize.STRING},
        wishlistcount:{type: sequelize.INTEGER},
        sold: {type: sequelize.INTEGER},
        sales: {type: sequelize.INTEGER},
        Owner:{type:sequelize.STRING},
        // OwnerID:{type: sequelize.INTEGER, references:{
        //     model: 'user',
        //     key: 'id'
        // } },
        posterURL: { type: sequelize.STRING }, 
        stars_given: { type: sequelize.INTEGER},
        reviews_given: { type: sequelize.INTEGER},
},
    {
        freezeTableName: true,
        timestamps: true,
        sequelize: db,
        modelName: "product",
    }
)    

module.exports = Product;