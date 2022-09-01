const mySQLDB = require('./DBConfig');
const Product = require('../models/Product');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Msg = require('../models/Msg');
const Cart = require('../models/Cart');
const CartProduct = require('../models/CartProduct');
// If drop is true, all existing tables are dropped and recreated
const setUpDB = (drop) => {
    mySQLDB.authenticate()
        .then(() => {
            console.log('Database connected');
            /*
            Defines the relationship where a user has many videos.
            The primary key from user will be a foreign key in video.
            */
            Chat.belongsTo(User, {as: "buyer", foreignKey: 'buyerId'} )
            User.hasMany(Chat, {as: "buyer", foreignKey: 'buyerId'} )

            Chat.belongsTo(Product, {as: "product", foreignKey: 'productId'} )
            Product.hasMany(Chat, {as: "product", foreignKey: 'productId'} )

            Product.belongsToMany(Cart, { through: CartProduct })
            Cart.belongsToMany(Product, { through: CartProduct })

            User.hasOne(Cart)
            Cart.belongsTo(User)

            Msg.belongsTo(Chat)
            Chat.hasMany(Msg)

            Msg.belongsTo(User)
            User.hasMany(Msg)

            mySQLDB.sync({
                alter: true,
                force: drop
            })
                .then(console.log("Successfully altered and sync"))
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
};


module.exports = { setUpDB };