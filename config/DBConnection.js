const mySQLDB = require('./DBConfig');
const Product = require('../models/Product');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Msg = require('../models/Msg');
const Wishlist = require('../models/Wishlist');
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

            Msg.belongsTo(Chat)
            Chat.hasMany(Msg)

            Msg.belongsTo(User)
            User.hasMany(Msg)

            Wishlist.belongsTo(User);
            User.hasMany(Wishlist);
            Wishlist.belongsTo(Product);

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