const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User.js")

function initalize(passport) {
    passport.use(
        new LocalStrategy(
            { usernameField: "email" },
            async (email, password, done) => {
                try {
                    const user = await User.findOne({ where: { email } });
                    console.log(user?.compareHash(password));
                    return user?.compareHash(password)
                        ? done(null, user)
                        : done(null, false, { message: "Invalid Login Credentials. Please check your email and password and try again" });
                } catch (e) {
                    console.log(e);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        return done(null, user.id);
    });
    passport.deserializeUser(async (id, done) => {
        return done(null, await User.findOne({ where: { id } }));
    });
}

module.exports = initalize;