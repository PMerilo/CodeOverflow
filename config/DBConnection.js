const mySQLDB = require('./DBConfig');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Msg = require('../models/Msg');
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
            User.hasMany(Chat)

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