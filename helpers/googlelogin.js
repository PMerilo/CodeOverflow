

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = '811352968755-2b8tpr27pohva650mbcgc40j7l0c1aol.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
const passport = require('passport');
const User = require('../models/User');
const flashMessage = require('./messenger');
function googlelogin() {
    
    passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/login-google/callback"
      },
        async function(accessToken, refreshToken, profile, done) {
            const [user, created] = await User.findOrCreate({
                where: {email: profile.emails[0].value},
                defaults: {
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    profilepic : profile.photos[0].value, 
                    'banned': 0, 
                },
            })
            if (created) {
                
                // flashMessage(res, 'success', 'Welcome! Thank you for creating your account.')
                return done(null, user,{ message: 'Welcome! Thank you for creating your account.'})
            } else {
                if (user.pfp != profile.photos[0].value) {
                    User.update(
                        {pfp : profile.photos[0].value},
                        {where: {id : user.id}})
                        .catch(err => console.log(err))
                }
                // flashMessage(res, 'success', 'Welcome! You have logged in.')
                return done(null, user,{ message: 'Welcome! You have logged in.'})
            }
        }
    ));

    passport.serializeUser((user, done) => {
        return done(null, user)
    });
    passport.deserializeUser((user, done) => {
        return done(null, user)
    });
}

module.exports = googlelogin;
