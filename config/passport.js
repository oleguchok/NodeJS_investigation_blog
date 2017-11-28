const LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    configAuth = require('./auth'),
    DB = require('./constants'),
    UserBusiness = require('../business/UserBusiness');

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    passport.use('local', new LocalStrategy((username, password, done) => {
        UserBusiness.getUserByCredentials(username, password)
            .then((user) => {

                global.User = {
                    id: user.UserID,
                    name: user.Name,
                    password: user.Password
                };

                return done(null, {
                    userId: user.UserID,
                    username: user.Name
                });

            }).catch(() => {
                return done(null, false); //Check done 1 argument
            });
    }));

    passport.use(new FacebookStrategy({
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL
    }, (token, refreshToken, profile, done) => {
        process.nextTick(() => {
            UsersBusiness.getUserByFacebookId(profile.id).spread((result, metadata) => {
                if (result.length === 1) {
                    return done(null, {
                        userId: result[0].userId,
                        username: result[0].username
                    });
                } else {
                    UsersBusiness.addNewFacebookUser(profile.id);
                    return done(null, { facebookId: profile.id });
                }
            })
        });
    }));
}